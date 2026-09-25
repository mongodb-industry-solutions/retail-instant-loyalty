"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProgressCircle } from "@via-ds/components/progress-circle";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectProductsState,
  selectLoyaltyConfig,
  setSelectedUser,
  setProductsData,
  setProductsError,
  setLoyaltyConfigData,
  setLoyaltyConfigError,
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
  subscribeToChanges,
} from "@/lib/api";

export default function EcommerceLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedUser = useSelector(selectSelectedUser);
  const selectedCustomerId = selectedUser?.customerId;
  const products = useSelector(selectProductsState);
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  useEffect(() => {
    if (selectedUser) return;
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
            if (cancelled) return;
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
    if (!selectedCustomerId) return;

    let active = true;
    let refreshing = false;
    let refreshAgain = false;

    const refreshCustomer = async () => {
      if (refreshing) {
        refreshAgain = true;
        return;
      }

      refreshing = true;
      do {
        refreshAgain = false;
        try {
          // TODO. CHnage stream shouldnt call backend
          // TODO. change stream should receive the event object which contains event.fullDocument
          const customer = await fetchCustomer(selectedCustomerId);
          if (active) dispatch(setSelectedUser(customer));
        } catch (err) {
          console.error("Unable to refresh customer after change", err);
        }
      } while (active && refreshAgain);
      refreshing = false;
    };

    const unsubscribe = subscribeToChanges(
      {
        collection: "customers",
        field: "customerId",
        value: selectedCustomerId,
      },
      refreshCustomer,
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [selectedCustomerId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProducts(), fetchLoyaltyConfig()])
      .then(([products, config]) => {
        if (cancelled) return;
        dispatch(setProductsData(products));
        dispatch(
          setLoyaltyConfigData({
            rewardDetails: config.rewardDetails,
            campaign: config.campaign,
          }),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = String(err?.message ?? err);
        dispatch(setProductsError(msg));
        dispatch(setLoyaltyConfigError(msg));
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

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
