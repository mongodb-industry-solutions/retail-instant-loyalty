"use client";

import { Card } from "@via-ds/components/card";
import { Skeleton } from "@via-ds/components/skeleton";
import { H1, Body } from "@via-ds/components/typography";
import { toast } from "@via-ds/components/toast";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  selectUsers,
  setSelectedUser,
  setUsersData,
} from "@/redux/slices/GlobalSlice";
import { useRouter } from "next/navigation";
import { startSession, fetchSessions } from "@/lib/api";
import { setActivePersonaCookie } from "@/lib/cookies";
import { personaAvatar } from "@/lib/data";
import styles from "./Personas.module.css";
import Image from "next/image";

export default function Personas() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, data } = useSelector(selectUsers);
  const [claiming, setClaiming] = useState(null);

  // Count within each gender so personas sharing one draw get different
  // illustrations wherever the pool allows.
  const seenByGender = {};
  const avatars = data.map((p) => {
    const gender = String(p.gender).toLowerCase();
    seenByGender[gender] = seenByGender[gender] ?? 0;
    return personaAvatar(p.gender, seenByGender[gender]++);
  });

  async function handleSelect(persona) {
    setClaiming(persona.customerId);
    try {
      // Claims the persona and returns the full customer document — richer
      // than the list projection, so it becomes the selected user directly.
      const customer = await startSession(persona.customerId);
      dispatch(setSelectedUser(customer));
      // Cookie is what middleware.js gates on, so it has to be set before we
      // navigate into the store.
      await setActivePersonaCookie(customer.customerId);
      router.push("/");
    } catch (err) {
      if (err.code === "CUSTOMER_ALREADY_IN_USE") {
        // Expected when two demos run at once: refresh the grid so the
        // claimed persona drops out rather than showing an error.
        toast.error("That persona was just taken — pick another");
        fetchSessions()
          .then((customers) => dispatch(setUsersData(customers ?? [])))
          .catch(() => {});
      } else {
        toast.error(`Couldn't start the session: ${err.message}`);
      }
      setClaiming(null);
    }
  }

  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <span className={styles.eyebrow}>This is a MongoDB demo</span>
        <H1 className={styles.title}>Welcome to Leafy Loyalty Store</H1>
        <Body className={styles.sub}>
          Please select the user you would like to login as.
        </Body>

        {error && (
          <Body
            className={styles.sub}
            style={{ color: "var(--red-base, #C4342A)" }}
          >
            Couldn&apos;t load the personas ({error})
          </Body>
        )}

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={styles.card} />
              ))
            : data.map((p, i) => (
                <Card
                  key={p.customerId}
                  as="button"
                  className={styles.card}
                  disabled={claiming !== null}
                  onClick={() => handleSelect(p)}
                >
                  <div className={styles.top}>
                    <Image
                      src={avatars[i]}
                      alt={p.name}
                      className={styles.photo}
                      width={74}
                      height={74}
                      unoptimized
                    />
                  </div>
                  <div className={styles.name}>
                    {p.name} {p.lastName}
                  </div>
                  <div
                    className={`${styles.foot} ${p.isAlwaysNewUser ? styles.footNew : styles.footReturning}`}
                  >
                    {p.isAlwaysNewUser ? "New user" : "Existing user"}
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </main>
  );
}
