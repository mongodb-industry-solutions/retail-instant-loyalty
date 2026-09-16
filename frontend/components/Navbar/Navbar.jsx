"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@via-ds/components/badge";
import { Button } from "@via-ds/components/button";
import {
  Menu,
  MenuItem,
  MenuItemVariant,
  MenuPopover,
  MenuRoot,
  MenuSection,
  MenuSeparator,
} from "@via-ds/components/menu";
import { Logo } from "@via-ds/components/logo";

import { endSession } from "@/lib/api";
import { clearActivePersonaCookie } from "@/lib/cookies";
import { resetGlobalState } from "@/redux/slices/GlobalSlice";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedUser, getCartCount } from "@/redux/slices/GlobalSlice";
import { openModal } from "@/redux/slices/GlobalSlice";
import styles from "./Navbar.module.css";
import shared from "@/components/shared.module.css";
import {
  SearchIcon,
  WandIcon,
  GearIcon,
  HistoryIcon,
  LogoutIcon,
  CartIcon,
  ProfileIcon,
  OrdersIcon,
} from "@/components/Icons/Icons";
import { tierBadgeVariant } from "@/components/tierBadgeVariant";

function PromoBanner() {
  return (
    <div className={styles.promoBanner}>
      🎉 Current promotion: <b>Winter</b> · Earn <b>{2}× loyalty coins</b> on
      every purchase.
    </div>
  );
}
const routeList = {
  store: "/",
  coinHistory: "/coin-history",
  cart: "/cart",
  profile: "/profile",
  orders: "/orders",
};

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  console.log("selected user in Navbar.jsx:", persona);
  const count = useSelector(getCartCount);
  async function handleLogout() {
    try {
      // Releases the persona back to the pool. Without this the customer
      // stays claimed and disappears from the login grid for good.
      await endSession();
    } catch (err) {
      // Nothing useful to offer the user here — they're leaving either way,
      // and a stuck claim can be cleared with /sessions/end-all.
      console.error("Couldn't end the session:", err.message);
    } finally {
      // Always clear the cookie, even if the release failed: otherwise
      // middleware keeps the user in the store with no way back to /login.
      await clearActivePersonaCookie();
      // Navigate before clearing the user: resetting first re-runs the
      // layout's session effect against a cookie that is already gone.
      router.replace("/login");
      dispatch(resetGlobalState());
    }
  }

  if (!persona) return null;

  function go(route) {
    router.push(routeList[route]);
  }

  return (
    <div>
      <PromoBanner />
      <header className={styles.topnav}>
        <div className={styles.brand}>
          <Logo logo="MongoDBLogoMark" size="medium" />
          Leafy Loyalty
        </div>
        <div className={styles.navSearchGroup}>
          <div className={styles.navSearch}>
            <SearchIcon />
            <input type="text" placeholder="Find your next favorite" />
          </div>
          <button
            className={`${shared.wandIconBtn} ${shared.wandIconBtnOutside}`}
            title="About MongoDB Atlas Search"
            aria-label="About MongoDB Atlas Search"
            onClick={() => dispatch(openModal({ modalType: "searchInfo" }))}
          >
            <WandIcon size={16} />
          </button>
        </div>
        <div className={styles.navRight}>
          <button
            className={styles.utilBtn}
            onClick={() => dispatch(openModal({ modalType: "talkTrack" }))}
          >
            <WandIcon />
            Talk track!
          </button>
          <button
            className={styles.utilBtn}
            onClick={() => dispatch(openModal({ modalType: "admin" }))}
          >
            <GearIcon />
            Admin
          </button>
          <MenuRoot>
            <Button
              variant="tertiary"
              className={styles.personaChip}
              aria-label="Customer menu"
            >
              <div
                className={styles.personaAvatar}
                style={{ background: "lightgreen", color: "black" }}
              >
                {persona.profile.firstName.slice(0, 1).toUpperCase()}
              </div>

              <span className={styles.pname}>{persona.profile.firstName}</span>

              <Badge
                variant={tierBadgeVariant(
                  persona.loyaltyDetails?.activeTier ?? "new",
                )}
              >
                {persona.loyaltyDetails?.activeTier ?? "New"}
              </Badge>
            </Button>

            <MenuPopover>
              <Menu aria-label="Customer actions">
                <MenuSection aria-label="Customer information">
                  <MenuItem
                    id="coin-history"
                    textValue="Coin history"
                    onAction={() => go("coin-history")}
                  >
                    <HistoryIcon slot="icon" />
                    Coin history
                  </MenuItem>
                  <MenuItem
                    id="profile"
                    textValue="Profile"
                    onAction={() => go("profile")}
                  >
                    <ProfileIcon slot="icon" />
                    Profile
                  </MenuItem>
                  <MenuItem
                    id="order-history"
                    textValue="Order history"
                    onAction={() => go("orders")}
                  >
                    <HistoryIcon slot="icon" />
                    Order history
                  </MenuItem>
                </MenuSection>

                <MenuSeparator />

                <MenuItem
                  id="logout"
                  textValue="Log out"
                  variant={MenuItemVariant.Destructive}
                  onAction={handleLogout}
                >
                  <LogoutIcon slot="icon" />
                  Log out
                </MenuItem>
              </Menu>
            </MenuPopover>
          </MenuRoot>
          <button className={styles.cartBtn} onClick={() => go("cart")}>
            <CartIcon />
            {count > 0 && <span className={styles.cartCount}>{count}</span>}
          </button>
        </div>
      </header>
    </div>
  );
}
