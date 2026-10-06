"use client";

import shared from "@/components/shared.module.css";
import styles from "./ProfileView.module.css";
import profile from "@/components/Profile.module.css";
import { TIER_BENEFITS } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@via-ds/components/button";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
  openModal,
} from "@/redux/slices/GlobalSlice";
import { formatCoinValue, formatPrice, personaFullName } from "@/lib/helper";
import TierTrack from "@/components/TierTrack/TierTrack";
import { Text, H3 } from "@via-ds/components/typography";
import TierBadge from "@/components/TierBadge/TierBadge";

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
              <TierBadge overwriteTier={t.tierKey}/>
              {isCurrent && (
                <Text elementType="span" className={styles.benefitYou}>
                  Current
                </Text>
              )}
            </div>
            <div className={styles.benefitSpend}>
              <Text>Text {formatPrice(t.threshold)}+ spend</Text>
            </div>
            <div className={`${styles.benefitRate} mono`}>
              <Text>1 coin = {formatCoinValue(t.tierKey, rewardDetails)}</Text>
            </div>
            <ul className={styles.benefitList}>
              {(TIER_BENEFITS[t.tierKey] ?? []).map((item, i) => (
                <li key={i}>
                  <Text>{item}</Text>
                </li>
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
  const fullName = personaFullName(persona);
  const paymentLabel = persona.paymentDetails
    ? `Visa ending in ${persona.paymentDetails.last4}`
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
          <Text size="medium">Continue shopping</Text>
        </a>{" "}
        /{" "}
        <Text elementType="span" className={shared.current}>
          My profile
        </Text>
      </div>
      <div className={`${profile.profileHead} ${styles.profileHeadEnhanced}`}>
        <div
          className={profile.profileAvatar}
          style={{ background: "lightgreen" }}
        >
          <H3>{persona.profile.firstName.slice(0, 1).toUpperCase()}</H3>
        </div>
        <div>
          <div className={profile.profileName}>
            <Text size="large">{fullName}</Text>
          </div>
          <div className={profile.profileSub}>
            {persona.isAlwaysNewUser
              ? `New customer - ${persona.profile.email}`
              : `${persona.loyaltyDetails.activeTier} tier · ${persona.profile.email}`}
          </div>
        </div>
        <div className={profile.profileBalance}>
          <div className={profile.lbl}>
            <Text>Coin balance</Text>
          </div>
          <div className={`${profile.num} mono`}>
            {persona.loyaltyDetails.coinBalance?.toLocaleString()}
          </div>
        </div>
        <Button
          hidden
          type="primary"
          className={styles.actionBtn}
          onClick={() => dispatch(openModal({ modalType: "profileEdit" }))}
        >
          <Text>Edit customer details</Text>
        </Button>
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
                <Text textStyle="heading3">Personal details</Text>
                <p>Contact information for the customer account.</p>
              </div>
            </div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.detailLabel}>Full name</span>
                <Text textStyle="Subtitle">{fullName}</Text>
              </div>
              <div>
                <span className={styles.detailLabel}>Email address</span>
                <Text textStyle="Subtitle">{persona.profile.email}</Text>
              </div>
            </div>
          </section>
          <section className={shared.historyCard}>
            <div className={styles.sectionHead}>
              <div>
                <Text textStyle="heading3">Delivery address</Text>
                <p>Used for online purchases and reward shipments.</p>
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.settingIcon}>⌂</div>
              <div>
                <Text textStyle="Subtitle">{fullName}</Text>
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
                <Text textStyle="heading3">Payment method</Text>
                <p>Default method for cash purchases.</p>
              </div>
            </div>
            <div className={styles.paymentRow}>
              <div className={styles.settingIcon}>$</div>
              <div>
                <Text textStyle="Subtitle">{paymentLabel}</Text>
                <span>
                  Default payment method · Expires{" "}
                  {persona.paymentDetails.expiry || "—"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className={`${shared.historyCard} ${styles.benefitsCard}`}>
        <div className={styles.sectionHead}>
          <div>
            <Text textStyle="heading3">Tier benefits</Text>
            <p>
              Compact view of the program benefits and redemption value at each
              tier.
            </p>
          </div>
          <Text elementType="span" className={styles.currentTier}>
            {tier ? `${tier} tier` : "Not yet enrolled"}
          </Text>
        </div>
        <TierBenefits
          rewardDetails={rewardDetails}
          currentTierKey={persona.loyaltyDetails ? tier : null}
        />
      </section>
      <section className={`${shared.historyCard} ${styles.dataCard}`}>
        <div className={styles.sectionHead}>
          <div>
            <Text textStyle="heading3">Your data</Text>
            <Text>
              Your account and loyalty balance live together in one flexible
              document.
            </Text>
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
