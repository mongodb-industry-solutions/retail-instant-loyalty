"use client";
import { useState } from "react";
import { H1, H2, Body, H3 } from "@via-ds/components/typography";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@via-ds/components/segmented-control";
import { formatCoinValue, tierProgressValue } from "@/lib/helper";
import { useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectProductsState,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";
import styles from "./StoreView.module.css";
import sharedStyles from "@/components/shared.module.css";
import { WandIcon } from "@/components/Icons/Icons";
import TierTrack from "@/components/TierTrack/TierTrack";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/ProductCard/ProductCard";

export default function StoreView() {
  //Will change it to home
  const selectedUser = useSelector(selectSelectedUser);
  const { data: products, loading } = useSelector(selectProductsState);
  const { rewardDetails, campaign } = useSelector(selectLoyaltyConfig);
  const recommended = products
    .filter((p) => selectedUser?.profile?.interests?.includes(p.category))
    .slice(0, 4); // Filter products based on selected user's interests and limit to 4
  const SKELETON_COUNT = 4;
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];
  const [activeCategory, setActiveCategory] = useState("All"); // Placeholder for active category state
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);
  const tierInfo = {
    activeTier: selectedUser.loyaltyDetails?.activeTier,
    nextTier: selectedUser.loyaltyDetails?.nextTier,
  };

  return (
    <main className={sharedStyles.page}>
      {selectedUser?.loyaltyDetails ? (
        <div className={styles.hero}>
          <div>
            <div className={styles.heroEyebrow}> Welcome back </div>
            <H2>Hi, {selectedUser.profile.firstName} 👋</H2>
            <div className={styles.memberPerkLine}>
              {selectedUser.loyaltyDetails?.activeTier} member - redemption
              value{" "}
              {formatCoinValue(
                selectedUser.loyaltyDetails?.activeTier,
                rewardDetails,
              )}{" "}
              per coin · free shipping over $200.
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroStats}>
              <div className={styles.statBox}>
                <div className={styles.num}>{5}</div>
                <div className={styles.lbl}>Orders</div>
              </div>
              <div className={`${styles.statBox} ${styles.statBoxGold}`}>
                <div className={styles.num}>
                  {selectedUser.loyaltyDetails?.activeTier}
                </div>
                <div className={styles.lbl}>Tier</div>
              </div>
              <div className={styles.statBox}>
                <div className={`${styles.num} mono`}>
                  {selectedUser.loyaltyDetails?.balance?.toLocaleString()}
                </div>
                <div className={styles.lbl}>Coins</div>
              </div>
            </div>
            <TierTrack
              amountSpent={selectedUser.loyaltyDetails.totalAmountSpent}
              tierInfo={tierInfo}
              rewardDetails={rewardDetails}
              customerData={selectedUser}
            />
          </div>
        </div>
      ) : (
        <div className={styles.hero}>
          <div>
            <div className={styles.heroEyebrow}>Welcome</div>
            <H2>Leafy Loyalty, built to show instant rewards.</H2>
            <Body>
              Explore the store, place a first order, and show how a modern
              loyalty platform can credit rewards immediately instead of waiting
              on overnight processing.
            </Body>
          </div>
          <div className={styles.heroRight}>
            <div
              className={`${styles.profileCard} ${styles.profileCardHighlight}`}
              style={{ padding: 18, margin: 0, minWidth: 280 }}
            >
              <div className={styles.detailLabel}>Loyalty journey</div>
              <div className={styles.detailValue} style={{ marginTop: 6 }}>
                Start with the first purchase
              </div>
              <div
                className={styles.profileSectionIntro}
                style={{ margin: "10px 0 0" }}
              >
                Earn coins, unlock tiers, and bring the customer back into the
                journey while purchase intent is still high.
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedUser.loyaltyDetails && (
        <section className={styles.block}>
          <div className={`${styles.blockHead} ${styles.blockHeadStack}`}>
            <div>
              <H3 className={styles.sectionHeadInline}>
                Recommended for you
                <button
                  className={sharedStyles.wandIconBtn}
                  title="How Atlas powers these recommendations"
                  aria-label="How Atlas powers these recommendations"
                  onClick={() => dispatch(openModal({ modalType: "recsInfo" }))}
                >
                  <WandIcon />
                </button>
              </H3>
              <div className={styles.sectionSubnote}>
                Inspired by your recent orders
              </div>
            </div>
          </div>
          <div className={styles.productGrid}>
            {loading
              ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : recommended.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
          </div>
        </section>
      )}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <H3 className={styles.sectionHeadInline}>
            {selectedUser ? (
              <>
                More to explore
                <button
                  className={sharedStyles.wandIconBtn}
                  title="How Atlas Search facets shape this section"
                  aria-label="How Atlas Search facets shape this section"
                  onClick={() =>
                    dispatch(openModal({ modalType: "facetsInfo" }))
                  }
                >
                  <WandIcon />
                </button>
              </>
            ) : (
              "Explore the store"
            )}
          </H3>
        </div>
        <div className={styles.categoryTabs}>
          <SegmentedControl
            value={activeCategory}
            labelPosition="side"
            onChange={(value) => {
              setActiveCategory(value);
            }}
            name="category-tabs"
          >
            {categories.map((category) => (
              <SegmentedControlItem key={category} value={category}>
                {category}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
