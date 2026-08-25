"use client"

import { createContext, useContext, useEffect, useReducer } from "react";
import { fetchCustomers } from "./api";

const LoyaltyStateContext = createContext(null);
const LoyaltyDispatchContext = createContext(null);

function initialState() {

    return {
        view: "persona",
        personas: {},
        loading: true,
        loadError: null
    }

}

export function useLoyaltyState() {
  const ctx = useContext(LoyaltyStateContext);
  if (!ctx) throw new Error("useLoyaltyState must be used within LoyaltyProvider");
  return ctx;
}

function reducer(state, action) {

    switch (action.type) {

        case "LOAD_INITIAL_DATA":
            return {
                ...state,
                personas: action.customers ?? {},
                loading: false,
                loadError: null
            };

        case "LOAD_INITIAL_DATA_ERROR":
            return {
                ...state,
                loading: false,
                loadError: action.error
            };

        default:
            return state;
    }

}

export default function LoyaltyProvider({ children }) {

    const [state, dispatch] = useReducer(reducer, undefined, initialState); 

    useEffect(() => {
        async function load() {
            try {
                const [customers, products, config, orderMeta] = await Promise.all([
                    fetchCustomers()
                ]);
                dispatch({ type: "LOAD_INITIAL_DATA", customers, products, config, orderMeta });
            } catch(err) {
                dispatch({ type: "LOAD_INITIAL_DATA_ERROR", error: String(err.message || err) });
            }
        }
        load()
    }, [])

    return (
        <LoyaltyStateContext.Provider value={state}>
        <LoyaltyDispatchContext.Provider value={dispatch}>{children}</LoyaltyDispatchContext.Provider>
        </LoyaltyStateContext.Provider>
    )

}