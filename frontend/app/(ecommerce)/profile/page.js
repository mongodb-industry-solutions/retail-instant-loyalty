"use client";

import shared from "@/components/shared.module.css";
import styles from "./ProfileView.module.css";
import profile from "@/components/Profile.module.css";
import { TIER_BENEFITS } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@via-ds/components/badge";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
  openModal,
} from "@/redux/slices/GlobalSlice";
import { tierBadgeVariant } from "@/components/tierBadgeVariant";
import { formatCoinValue, formatPrice } from "@/lib/helper";
import TierTrack from "@/components/TierTrack/TierTrack";

function TierBenefits({ rewardDetails, currentTierKey }) {
  return (
    <div className={styles.compactGrid}>
      {rewardDetails.map((t) => {
        const isCurrent = t.tierKey === currentTierKey;
        return (
          <div
            className={`${styles.benefitCard}${isCurrent ? ` ${styles.benefitCardCurrent}` : ""}`}
            key={t.tierKey}
          >
            <div className={styles.compactHead}>
              <Badge variant={tierBadgeVariant(t.tierKey)}>{t.tierName}</Badge>
              {isCurrent && <span className={styles.benefitYou}>Current</span>}
            </div>
            <div className={styles.benefitSpend}>
              {formatPrice(t.threshold)}+ spend
            </div>
            <div className={`${styles.benefitRate} mono`}>
              1 coin = {formatCoinValue(t.tierKey, rewardDetails)}
            </div>
            <ul className={styles.benefitList}>
              {(TIER_BENEFITS[t.tierKey] ?? []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfileView() {
  const router = useRouter();
  const persona = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const dispatch = useDispatch();
  const tier = persona.loyaltyDetails
    ? persona.loyaltyDetails.activeTier
    : null;
  const fullName =
    `${persona.profile.firstName || persona.name} ${persona.profile.lastName || ""}`.trim();
  const paymentLabel = persona.card
    ? `Visa ending in ${persona.card}`
    : "No payment method on file";

  const tierInfo = {
    activeTier: persona.loyaltyDetails?.activeTier,
    nextTier: persona.loyaltyDetails?.nextTier,
    dollarsNeededForNextTier: persona.loyaltyDetails?.dollarsNeededForNextTier,
  };

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          Continue shopping
        </a>{" "}
        / <span className={shared.current}>My profile</span>
      </div>
      <div className={`${profile.profileHead} ${styles.profileHeadEnhanced}`}>
        <div
          className={profile.profileAvatar}
          style={{ background: persona.avatarBg, color: persona.avatarColor }}
        >
          {persona.initial}
        </div>
        <div>
          <div className={profile.profileName}>{persona.name}</div>
          <div className={profile.profileSub}>
            {persona.loyaltyDetails
              ? `${persona.loyaltyDetails.activeTier} tier · ${persona.profile.email}`
              : `New customer · ${persona.profile.email}`}
          </div>
        </div>
        <div className={profile.profileBalance}>
          <div className={profile.lbl}>Coin balance</div>
          <div className={`${profile.num} mono`}>
            {persona.loyaltyDetails.coinBalance?.toLocaleString()}
          </div>
        </div>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => dispatch(openModal({ modalType: "profileEdit" }))}
        >
          Edit customer details
        </button>
      </div>
      {persona.loyaltyDetails && (
        <div className={profile.profileTrackCard}>
          <TierTrack
            amountSpent={persona.loyaltyDetails.cumulativeSpendDollars}
            tierInfo={tierInfo}
            rewardDetails={rewardDetails}
            customerData={persona}
          />
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={shared.historyCard}>
            <div className={styles.sectionHead}>
              <div>
                <h3>Personal details</h3>
                <p>Contact information for the customer account.</p>
              </div>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.detailLabel}>Full name</span>
                <strong>{fullName}</strong>
              </div>
              <div>
                <span className={styles.detailLabel}>Email address</span>
                <strong>{persona.profile.email}</strong>
              </div>
            </div>
          </section>
          <section className={shared.historyCard}>
            <div className={styles.sectionHead}>
              <div>
                <h3>Delivery address</h3>
                <p>Used for online purchases and reward shipments.</p>
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.settingIcon}>⌂</div>
              <div>
                <strong>{fullName}</strong>
                <p>
                  {persona.addresses[0].line1}
                  <br />
                  {persona.addresses[0].city}
                </p>
                <p>
                  {persona.addresses[0].line2}
                  <br />
                  {persona.addresses[0].state} {persona.addresses[0].postalCode}
                </p>
              </div>
            </div>
          </section>
        </div>
        <aside className={styles.side}>
          <section className={shared.historyCard}>
            <div className={styles.sectionHead}>
              <div>
                <h3>Payment method</h3>
                <p>Default method for cash purchases.</p>
              </div>
            </div>
            <div className={styles.paymentRow}>
              <div className={styles.settingIcon}>$</div>
              <div>
                <strong>{paymentLabel}</strong>
                <span>
                  Default payment method · Expires {persona.exp || "—"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className={`${shared.historyCard} ${styles.benefitsCard}`}>
        <div className={styles.sectionHead}>
          <div>
            <h3>Tier benefits</h3>
            <p>
              Compact view of the program benefits and redemption value at each
              tier.
            </p>
          </div>
          <span className={styles.currentTier}>
            {tier ? `${tier.tierName} tier` : "Not yet enrolled"}
          </span>
        </div>
        <TierBenefits
          rewardDetails={rewardDetails}
          currentTierKey={persona.loyaltyDetails ? tier.tierKey : null}
        />
      </section>
      <section className={`${shared.historyCard} ${styles.dataCard}`}>
        <div className={styles.sectionHead}>
          <div>
            <h3>Your data</h3>
            <p>
              Your account and loyalty balance live together in one flexible
              document.
            </p>
          </div>
          <button
            type="button"
            className={styles.docSeeBtn}
            title="See document model"
            onClick={() => dispatch(openModal({ modalType: "userDoc" }))}
          >
            {"{ } See schema"}
          </button>
        </div>
      </section>
    </main>
  );
}
