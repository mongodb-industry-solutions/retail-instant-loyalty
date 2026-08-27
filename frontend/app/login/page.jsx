'use client'
import Personas from "@/components/Personas/Personas";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCustomers } from "@/lib/api";
import {
  setUsersData,
  setUsersError,
  setUsersLoading,
} from "@/redux/slices/GlobalSlice";

export default function Page() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUsersLoading(true));
    dispatch(setUsersError(null));

    fetchCustomers()
      .then((customers) => {
        dispatch(setUsersData(customers ?? []));
      })
      .catch((err) => {
        dispatch(setUsersError(String(err?.message ?? err)));
      })
      .finally(() => {
        dispatch(setUsersLoading(false));
      });
  }, [dispatch]);

  return ( 
    <Personas />
  );
}
