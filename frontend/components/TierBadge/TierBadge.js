"use client";
import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { Badge } from "@via-ds/components/badge";
import { Text } from "@via-ds/components/typography";
import styles from "./TierBadge.module.css";

const TierBadge = ({ overwriteTier = null }) => {
  const selectedTier = useSelector(selectSelectedUser)?.loyaltyDetails?.activeTier;
  const activeTier = overwriteTier || selectedTier || null;
  if (!activeTier) return null;

  return (
    <Badge className={`${styles[`tier-badge-${activeTier?.toLowerCase()}`]}`}>
      <Text>{activeTier}</Text>
    </Badge>
  );
};

export default TierBadge;
