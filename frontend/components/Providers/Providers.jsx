"use client";

import { Provider as ReduxProvider } from "react-redux";
import { ViaProvider } from "@via-ds/components/provider";
import { Toaster } from "@via-ds/components/toast";
import store from "@/redux/store";

// Previously split across two files. app/ClientProvider.js held only the Redux
// provider and wrapped this component in the root layout:
//
// "use client";
// import { Provider } from "react-redux";
// import store from "../redux/store";
//
// export default function ClientProvider({ children }) {
//   return <Provider store={store}>{children}</Provider>
// }

export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <>
        {/* Via components read their design tokens + color-scheme from
                    this provider; without it variants render unstyled. */}
        <ViaProvider colorScheme="light">
          {children}
          {/* Via's Toaster is styled entirely by design tokens --
                        no position/toastOptions props to configure. */}
          <Toaster colorScheme="dark" />
        </ViaProvider>
      </>
    </ReduxProvider>
  );
}
