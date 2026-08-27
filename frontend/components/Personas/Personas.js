"use client"
import { Card } from "@leafygreen-ui/card";
import { CardSkeleton } from "@leafygreen-ui/skeleton-loader";
import { H1, Body } from "@leafygreen-ui/typography";
import { useDispatch, useSelector } from "react-redux";
import { selectUsers, setSelectedUser } from "@/redux/slices/GlobalSlice";
import { selectUser } from "@/lib/cookies";
import styles from "./Personas.module.css";
import Image from "next/image";

export default function Personas() {

  const dispatch = useDispatch();
  const { loading, error, data: personas } = useSelector(selectUsers);

  async function handleSelect(persona) {
    dispatch(setSelectedUser(persona));
    await selectUser(persona.id);
  }

  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <span className={styles.eyebrow}>This is a MongoDB demo</span>
        <H1 className={styles.title}>Welcome to Leafy Loyalty Store</H1>
        <Body className={styles.sub}>Please select the user you would like to login as.</Body>

        {error && (
          <Body className={styles.sub} style={{ color: "var(--red-base, #C4342A)" }}>
            Couldn&apos;t load the personas ({error})
          </Body>
        )}

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} className={styles.card} />
              ))
            : personas.map((p) => (
                <Card
                  key={p.id}
                  as="button"
                  className={styles.card}
                  onClick={() => handleSelect(p)}
                >
                  <div className={styles.top}>
                    <Image
                      src={p.photo}
                      alt={p.name}
                      className={styles.photo}
                      width={64}
                      height={64}
                      unoptimized
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
