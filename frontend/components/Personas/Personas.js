"use client";

import { Card } from "@via-ds/components/card";
import { Skeleton } from "@via-ds/components/skeleton";
import { H1, Body } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { selectUsers, setSelectedUser } from "@/redux/slices/GlobalSlice";
import { useRouter } from "next/navigation";
import { setSelectedUserCookie } from "@/lib/cookies";
import styles from "./Personas.module.css";
import Image from "next/image";

export default function Personas() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, data } = useSelector(selectUsers);

  async function handleSelect(persona) {
    dispatch(setSelectedUser(persona));
    await setSelectedUserCookie(persona.CustomerID); //cookie is being set
    router.push("/");
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
            : data.map((p) => (
                <Card
                  key={p.CustomerID}
                  as="button"
                  className={styles.card}
                  onClick={() => handleSelect(p)}
                >
                  <div className={styles.top}>
                    <Image
                      src={p.photo}
                      alt={p.profile.firstName}
                      className={styles.photo}
                      width={74}
                      height={74}
                      unoptimized
                    />
                  </div>
                  <div className={styles.name}>
                    {p.profile.firstName} {p.profile.lastName}
                  </div>
                  <div
                    className={`${styles.foot} ${p.profile.returning ? styles.footReturning : styles.footNew}`}
                  >
                    {p.profile.returning ? "Existing user" : "New user"}
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </main>
  );
}
