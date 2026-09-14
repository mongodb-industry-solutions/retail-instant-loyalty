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
import { readSelectedUserCookie, clearSelectedUserCookie } from "@/lib/cookies";
import { fetchCustomer, fetchProducts, fetchLoyaltyConfig } from "@/lib/api";

export default function EcommerceLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedUser = useSelector(selectSelectedUser);
  const products = useSelector(selectProductsState);
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  useEffect(() => {
    if (selectedUser) return;
    let cancelled = false;
    readSelectedUserCookie()
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
            clearSelectedUserCookie();
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
