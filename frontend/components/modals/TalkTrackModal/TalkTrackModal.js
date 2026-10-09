"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Text } from "@via-ds/components/typography";
import { WizardIcon } from "@/components/Icons/Icons";
import modal from "../Modal.module.css";
import BehindTheScenes from "./BehindTheScenes";
import LoyaltyValue from "./LoyaltyValue";
import WhyMongoDB from "./WhyMongoDB";
import HowToDemoLanding from "./HowToDemoLanding";
import HowToDemoCart from "./HowToDemoCart";
import HowToDemoCheckout from "./HowToDemoCheckout";
import HowToDemoConfirmation from "./HowToDemoConfirmation";
import HowToDemoProfile from "./HowToDemoProfile";
import HowToDemoOrderHistory from "./HowToDemoOrderHistory";
import HowToDemoLoyaltyHistory from "./HowToDemoLoyaltyHistory";

function HowToContent({ pathname }) {
  const route = pathname.replace(/\/+$/, "") || "/";

  switch (route) {
    case "/":
      return (<HowToDemoLanding/>);
    case "/cart":
      return (<HowToDemoCart/>);
    case "/checkout":
      return (<HowToDemoCheckout/>);
    case "/confirm":
    case "/confirmation":
      return (<HowToDemoConfirmation/>);
    case "/profile":
      return (<HowToDemoProfile/>);
    case "/orders":
      return (<HowToDemoOrderHistory/>);
    case "/coin-history":
      return (<HowToDemoLoyaltyHistory/>);
    default:
      return (
        <>
          <p>Use the demo as a retail journey, not a feature tour.</p>
          <ul>
            <li>
              <b>Start with persona selection</b> to show how loyalty context
              changes the shopper experience.
            </li>
            <li>
              <b>Browse products, complete a purchase, and review the result</b>{" "}
              to connect discovery, checkout, and loyalty updates.
            </li>
            <li>
              <b>Use Talk Track and Admin as presenter surfaces</b> for the
              architecture and program configuration details.
            </li>
          </ul>
        </>
      );
  }
}

const TABS = [
  {
    key: "howto",
    label: "How to demo this page",
    render: (pathname) => <HowToContent pathname={pathname} />,
  },
  {
    key: "what",
    label: "Instant loyalty",
    render: () => (<LoyaltyValue/>),
  },
  {
    key: "behind",
    label: "Behind the scenes",
    render: () => (<BehindTheScenes />),
  },
  {
    key: "mongodb",
    label: "Why MongoDB",
    render: () => (<WhyMongoDB/>),
  },
];

export default function TalkTrackModal({ onClose }) {
  const [active, setActive] = useState("howto");
  const pathname = usePathname() || "/";
  const tab = TABS.find((t) => t.key === active) || TABS[0];
  return (
    <>
      <div className={modal.head}>
        <Text as="h2">
          <WizardIcon size={18} aria-hidden="true" /> Talk track
        </Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${modal.tab} ${t.key === active ? modal.tabActive : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={modal.body}>{tab.render(pathname)}</div>
    </>
  );
}
