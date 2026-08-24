"use client"

import { Card } from "@leafygreen-ui/card";
import { CardSkeleton } from "@leafygreen-ui/skeleton-loader";
import { H1, Body } from "@leafygreen-ui/typography";
import { useLoyaltyState } from "@/lib/LoyaltyHelper";
import styles from "./Personas.module.css";

const personas = { mike: {
    id: "mike",
    name: "Mike",
    initial: "M",
    avatarBg: "#DCEBFF",
    avatarColor: "#2955A8",
    photo: "/rsc/users/66fe219d625d93a100528224.png",
    role: "Software engineer & gear enthusiast",
    tags: ["Electronics", "Gaming", "Productivity"],
    returning: true,
    coins: 3240,
    tierSpend: 2800,
    orders: 3,
    interests: ["Electronics"],
    ship: {
      first: "Mike",
      last: "Chen",
      email: "mike.chen@email.com",
      address: "214 Harbor View Dr, Apt 5",
      city: "Austin, TX 73301",
    },
    card: "4471",
    exp: "11/28",
    transactions: [
      { type: "earned", orderId: "MS-118820", label: "Order MS-118820", delta: 1200, balanceAfter: 1200 },
      { type: "earned", orderId: "MS-225143", label: "Order MS-225143", delta: 980, balanceAfter: 2180 },
      { type: "earned", orderId: "MS-309981", label: "Order MS-309981", delta: 1060, balanceAfter: 3240 },
    ],
    orderHistory: [
      { id: "MS-118820", type: "purchase", itemRefs: [{ id: "kb", qty: 1 }, { id: "dock", qty: 1 }], coins: 1200, subtotal: 268, status: "Delivered" },
      { id: "MS-225143", type: "purchase", itemRefs: [{ id: "hp", qty: 1 }], coins: 980, subtotal: 299, status: "Delivered" },
      { id: "MS-309981", type: "purchase", itemRefs: [{ id: "mon", qty: 1 }, { id: "watch", qty: 1 }], coins: 1060, subtotal: 848, status: "Delivered" },
    ],
  },
  lily: {
    id: "lily",
    name: "Lily",
    photo: "/rsc/users/65a546ae4a8f64e8f88fb89e.png",
    role: "Fitness coach & wellness advocate",
    tags: ["Sports", "Health", "Outdoor"],
    returning: false,
  },
  jane: {
    id: "jane",
    name: "Jane",
    initial: "J",
    avatarBg: "#EAE1FC",
    avatarColor: "#6B3AB3",
    photo: "/rsc/users/671ff0081ec726b417352702.png",
  },
  claude: {
    id: "claude",
    name: "Claude",
    initial: "C",
    avatarBg: "#FCF0D2",
    avatarColor: "#9A7A1D",
    photo: "/rsc/users/671ff2451ec726b417352703.png",
  },
};



export default function Personas() {
  const { loading, loadError } = useLoyaltyState(); // personas will come from here. for my I am using the constant value

    return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <span className={styles.eyebrow}>This is a MongoDB demo</span>
        <H1 className={styles.title}>Welcome to Leafy Loyalty Store</H1>
        <Body className={styles.sub}>Please select the user you would like to login as and we can then show the personas.</Body>
        
        {/* {loadError && (
          <Body className={styles.sub} style={{ color: "var(--red-base, #C4342A)" }}>
            Couldn&apos;t reach the backend at {process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"} — is it
            running? ({loadError})
          </Body>
        )} */}
        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} className={styles.card} />
              ))
            : Object.values(personas).map((p) => (
                <Card
                  key={p.id}
                  as="button"
                  className={styles.card}
                  onClick={() => dispatch({ type: "SELECT_PERSONA", id: p.id })}
                >
                  <div className={styles.top}>
                    <img
                      src={p.photo}
                      alt={p.name}
                      className={styles.photo}
                    />
                  </div>
                  <div className={styles.name}>{p.name}</div>
                  <div className={`${styles.foot} ${p.returning ? styles.footReturning : styles.footNew}`}>
                    {p.returning ? "Existing user" : "New user"}
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </main>
  );
}