"use client";
import React from "react";
import { logoutUser } from "@/lib/cookies";
import { resetGlobalState } from "@/redux/slices/GlobalSlice";
import Link from "next/link";
import { useDispatch } from "react-redux";

const Navbar = () => {
  const dispatch = useDispatch();

  async function handleLogout() {
    dispatch(resetGlobalState());
    await logoutUser();
  }

  return (
    <div>
      I am a shared navbar across all ecommerce pages{" "}
      <Link href="/coin-history">Coin History</Link>{" "}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;
