"use client";

import { useState } from "react";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "@/redux/slices/GlobalSlice";
import { loyaltySyncDocFor } from "@/lib/helper";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";

export default function SyncModal({ title, tabs, embedded = false }) {
  const dispatch = useDispatch();
  const [active, setActive] = useState("doc");
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const persona = useSelector(selectSelectedUser);
  const doc = loyaltySyncDocFor(persona, rewardDetails);
  const tab = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <>
      {!embedded && (
        <div className={modal.head}>
          <Text as="h2">{title}</Text>
          <button
            className={modal.close}
            onClick={() => dispatch(closeModal())}
          >
            ✕
          </button>
        </div>
      )}
      <div className={modal.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${modal.tab} ${t.key === active ? modal.tabActive : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={modal.body}>{tab.render({ doc })}</div>
    </>
  );
}
