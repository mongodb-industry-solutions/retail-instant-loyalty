"use client"

import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import { ToastProvider } from "@leafygreen-ui/toast";
import  styles from "./Providers.module.css"

export default function Providers({ children }) {

    console.log("Provider");

    return(
        <LeafyGreenProvider>
            <ToastProvider portalClassName={styles.toastPortal}>{children}</ToastProvider>
        </ LeafyGreenProvider>
    );

}