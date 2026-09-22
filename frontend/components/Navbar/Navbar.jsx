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
import {
  selectSelectedUser,
  getCartCount,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";
import { openModal } from "@/redux/slices/GlobalSlice";
import styles from "./Navbar.module.css";
import shared from "@/components/shared.module.css";
import { Text, H3 } from "@via-ds/components/typography";
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

function PromoBanner({ activeCampaign }) {
  return (
    <div className={styles.promoBanner}>
      🎉 Current promotion: <b>{activeCampaign[0]?.banner}</b> · Earn{" "}
      <b>{activeCampaign[0]?.multiplier}x loyalty coins</b> on every purchase.
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
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  const activeCampaign = loyaltyConfig?.campaign.filter(
    (campaign) => campaign.isActive,
  ) || [{ banner: "Promotion Coming Soon..." }];
  const count = useSelector(getCartCount);
  async function handleLogout() {
    try {
      await endSession();
    } catch (err) {
      console.error("Couldn't end the session:", err.message);
    } finally {
      await clearActivePersonaCookie();

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
      <PromoBanner activeCampaign={activeCampaign} />
      <header className={styles.topnav}>
        <div className={styles.brand}>
          <Logo logo="MongoDBLogoMark" size="medium" />
          <Text size="large">Leafy Loyalty</Text>
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
            <Text> Talk track! </Text>
          </button>
          <button
            className={styles.utilBtn}
            onClick={() => dispatch(openModal({ modalType: "admin" }))}
          >
            <GearIcon />
            <Text>Admin</Text>
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

              <Text elementType="span" className={styles.pname}>
                {persona.profile.firstName}
              </Text>

              <Badge
                variant={tierBadgeVariant(
                  persona.loyaltyDetails?.activeTier ?? "new",
                )}
              >
                <Text>{persona.loyaltyDetails?.activeTier ?? "New"}</Text>
              </Badge>
            </Button>

            <MenuPopover>
              <Menu aria-label="Customer actions">
                <MenuSection aria-label="Customer information">
                  <MenuItem
                    id="coin-history"
                    textValue="Coin history"
                    onAction={() => go("coinHistory")}
                  >
                    <HistoryIcon slot="icon" />
                    <Text>Coin history</Text>
                  </MenuItem>
                  <MenuItem
                    id="profile"
                    textValue="Profile"
                    onAction={() => go("profile")}
                  >
                    <ProfileIcon slot="icon" />
                    <Text>Profile</Text>
                  </MenuItem>
                  <MenuItem
                    id="order-history"
                    textValue="Order history"
                    onAction={() => go("orders")}
                  >
                    <HistoryIcon slot="icon" />
                    <Text>Order history</Text>
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
                  <Text>Log out</Text>
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
