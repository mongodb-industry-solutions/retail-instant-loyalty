"use client"

import { useEffect } from "react";
import LoyaltyProvider, { useLoyaltyState } from '@/lib/LoyaltyHelper';
import Personas from '../views/Personas/Personas';

function Shell() {
    const { view } = useLoyaltyState();

    if (view === "persona") {
        return <Personas />
    }
}

export default function LoyaltyApp(){

  console.log('Loyalty APP');

  return (
    <LoyaltyProvider>
      <Shell />
    </LoyaltyProvider>
  )
}