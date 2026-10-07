"use client";
import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { Badge } from "@via-ds/components/badge";
import { Text } from "@via-ds/components/typography";
import styles from "./TierBadge.module.css";

const TierBadge = ({ overwriteTier = null }) => {
  let selectedTier = useSelector(selectSelectedUser)?.loyaltyDetails?.activeTier;
  selectedTier = selectedTier
    ? selectedTier
    : null;
  const activeTier = overwriteTier || selectedTier || null;
  if (!activeTier) return null;

  return (
    <Badge className={`${styles[`tier-badge-${activeTier?.toLowerCase()}`]}`}>
      <Text>{activeTier.charAt(0).toUpperCase() + activeTier.slice(1)}</Text>
    </Badge>
  );
};

export default TierBadge;
