"use client";
import { Button } from "@via-ds/components/button";
import { useSelector } from "react-redux";
import { Text } from "@via-ds/components/typography";
import { selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { toast } from "@via-ds/components/toast";
import modal from "../Modal.module.css";
import shared from "../../shared.module.css";
import styles from "./ProfileEditModal.module.css";

export default function ProfileEditModal({ onClose }) {
  const persona = useSelector(selectSelectedUser);

  async function save() {
    toast.success("Profile saved successfully!");
  }

  return (
    <>
      <div className={modal.head}>
        <Text as="h2">Edit customer details</Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={`${modal.body} ${styles.body}`}>
        <div className={styles.fields}>
          <div className={shared.formRow}>
            <div className={shared.field}>
              <label htmlFor="profile-first">First name</label>
              <input
                id="profile-first"
                //ref={refs.first}
                defaultValue={persona.profile.firstName || ""}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="profile-last">Last name</label>
              <input
                id="profile-last"
                //ref={refs.last}
                defaultValue={persona.profile.lastName || ""}
              />
            </div>
          </div>
          <div className={shared.field}>
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              type="email"
              //ref={refs.email}
              defaultValue={persona.profile.email || ""}
            />
          </div>
          <div className={shared.field}>
            <label htmlFor="profile-address">Street address</label>
            <input
              id="profile-address"
              //ref={refs.address}
              defaultValue={persona.profile.address || ""}
            />
          </div>
          <div className={shared.field}>
            <label htmlFor="profile-city">City, state and ZIP</label>
            <input
              id="profile-city"
              //ref={refs.city}
              defaultValue={persona.profile.city || ""}
            />
          </div>
          <div className={shared.formRow}>
            <div className={shared.field}>
              <label htmlFor="profile-card">Card last four digits</label>
              <input
                id="profile-card"
                //ref={refs.card}
                inputMode="numeric"
                maxLength={4}
                defaultValue={persona.profile.card || ""}
              />
            </div>
            <div className={shared.field}>
              <label htmlFor="profile-exp">Expiration</label>
              <input
                id="profile-exp"
                //ref={refs.exp}
                placeholder="MM/YY"
                defaultValue={persona.profile.exp || ""}
              />
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          style={{ width: "100%" }}
          //isLoading={saving}
          loadingText="Saving…"
          onClick={save}
        >
          Save changes
        </Button>
      </div>
    </>
  );
}
