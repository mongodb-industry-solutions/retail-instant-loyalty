"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProgressCircle } from "@via-ds/components/progress-circle";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectProductsState,
  selectLoyaltyConfig,
  selectLastOrder,
  selectLastRedeem,
  selectRecommendationsData,
  setSelectedUser,
  patchSelectedUser,
  setProductsData,
  setProductsError,
  setRecommendationsData,
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
import { getSessionId } from "@/lib/session";
import {
  fetchCustomer,
  fetchProducts,
  fetchProductRecommendations,
  fetchLoyaltyConfig,
  endSession,
} from "@/lib/api";

export default function EcommerceLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedUser = useSelector(selectSelectedUser);
  const products = useSelector(selectProductsState);
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  const lastOrder = useSelector(selectLastOrder);
  const lastRedeem = useSelector(selectLastRedeem);
  const recommendations = useSelector(selectRecommendationsData);
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
            endSession().catch(() => {});
            clearActivePersonaCookie().catch(() => {});
            router.replace("/login");
          });
      })
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
      if (source.readyState === EventSource.CLOSED) {
        console.error("Customer change stream closed and will not retry");
      }
    };

    return () => {
      source.close();
    };
  }, [selectedUser?.customerId, dispatch]);

  const customerId = selectedUser?.customerId;
  const ordersCount = selectedUser?.loyaltyDetails?.ordersCount;
  const rewardDetails = loyaltyConfig.rewardDetails;
  useEffect(() => {
    // The session id is cleared as soon as logout starts, while the customer
    // reset can still re-trigger this effect; the backend rejects that (400).
    if (!customerId || !getSessionId()) return;
    let cancelled = false;
    fetchProductRecommendations(customerId)
      .then((data) => {
        if (!cancelled) dispatch(setRecommendationsData(data));
      })
      .catch(() => {
        if (!cancelled) dispatch(setRecommendationsData([]));
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, ordersCount, lastOrder, lastRedeem, rewardDetails, dispatch]);

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
          // Release the backend claim first; endSession() also clears the id.
          await endSession().catch(() => {});
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
  // Recommendations are part of the gate so the store page doesn't paint
  // skeletons and then swap them for cards. A failed fetch sets [] (not null),
  // so this can't hang. Later refreshes keep the old list, so they don't re-gate.
  if (
    !selectedUser ||
    products.loading ||
    loyaltyConfig.loading ||
    recommendations === null
  )
    return <ProgressCircle size="3xlarge" aria-label="Loading (3xlarge)" />;

  return (
    <>
      <Navbar />
      {children}
      <ModalRoot />
    </>
  );
}
