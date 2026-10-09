"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProgressCircle } from "@via-ds/components/progress-circle";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectProductsState,
  selectLoyaltyConfig,
  setSelectedUser,
  patchSelectedUser,
  setProductsData,
  setProductsError,
  setLoyaltyConfigData,
  setLoyaltyConfigError,
  resetGlobalState,
} from "@/redux/slices/GlobalSlice";
import Navbar from "@/components/Navbar/Navbar";
import ModalRoot from "@/components/modals/ModalRoot";
import {
  readActivePersonaCookie,
  clearActivePersonaCookie,
} from "@/lib/cookies";
import {
  fetchCustomer,
  fetchProducts,
  fetchLoyaltyConfig,
  endSession,
} from "@/lib/api";
import { clearSessionId } from "@/lib/session";

export default function EcommerceLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedUser = useSelector(selectSelectedUser);
  const products = useSelector(selectProductsState);
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  const sessionInvalid = useRef(false);
  useEffect(() => {
    if (selectedUser || sessionInvalid.current) return;
    let cancelled = false;
    readActivePersonaCookie()
      .then((id) => {
        if (cancelled) return;
        if (!id) {
          router.replace("/login");
          return;
        }
        fetchCustomer(id)
          .then((customer) => {
            if (cancelled || sessionInvalid.current) return;
            dispatch(setSelectedUser(customer));
          })
          .catch(() => {
            if (cancelled) return;
            // The cookie names a persona we can't load, so drop both the
            // claim and the cookie before bouncing to /login.
            endSession().catch(() => {});
            clearActivePersonaCookie().catch(() => {});
            router.replace("/login");
          });
      })
      // Logout clears the user synchronously, re-running this effect just as
      // the /login navigation starts -- which aborts the in-flight request.
      // We're already leaving, so there is nothing to recover.
      .catch(() => {
        if (cancelled) return;
        router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUser, dispatch, router]);

  useEffect(() => {
    const customerId = selectedUser?.customerId;
    if (!customerId) return;

    const source = new EventSource(`/api/customers/${customerId}/streamEvent`);

    source.addEventListener("customer-updated", (event) => {
      try {
        const { loyaltyDetails, profile } = JSON.parse(event.data);
        dispatch(patchSelectedUser({ loyaltyDetails, profile }));
      } catch (error) {
        console.error("Failed to parse customer-updated event:", error);
      }
    });

    source.onerror = () => {
      // EventSource hands us a bare Event with no detail (hence the useless
      // "{}"), and fires it on every drop — including the reconnects it
      // handles itself. Only a CLOSED socket is actually a failure.
      if (source.readyState === EventSource.CLOSED) {
        console.error("Customer change stream closed and will not retry");
      }
    };

    return () => {
      source.close();
    };
  }, [selectedUser?.customerId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((products) => {
        if (cancelled) return;
        dispatch(setProductsData(products));
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch(setProductsError(String(err?.message ?? err)));
      });
    fetchLoyaltyConfig({ retryMissing: true })
      .then((config) => {
        if (cancelled) return;
        dispatch(
          setLoyaltyConfigData({
            rewardDetails: config.rewardDetails,
            campaign: config.campaign,
          }),
        );
      })
      .catch(async (err) => {
        if (cancelled) return;
        if (
          err.code === "LOYALTY_CONFIG_NOT_FOUND" ||
          err.code === "SESSION_REQUIRED"
        ) {
          sessionInvalid.current = true;
          clearSessionId();
          dispatch(resetGlobalState());
          try {
            await clearActivePersonaCookie();
            if (!cancelled) router.replace("/login");
          } catch (error) {
            if (!cancelled)
              dispatch(setLoyaltyConfigError(String(error?.message ?? error)));
          }
          return;
        }
        dispatch(setLoyaltyConfigError(String(err?.message ?? err)));
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

  // Gate on `selectedUser` itself, not a sticky local flag: on logout the user
  // is cleared synchronously while the /login redirect is still in flight, and
  // children read `selectedUser.profile` unguarded.
  if (!selectedUser || products.loading || loyaltyConfig.loading)
    return <ProgressCircle size="3xlarge" aria-label="Loading (3xlarge)" />;

  return (
    <>
      <Navbar />
      {children}
      <ModalRoot />
    </>
  );
}
