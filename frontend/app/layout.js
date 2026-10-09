import Providers from "@/components/Providers/Providers";

import "@via-ds/tokens/tokens.css";
import "@via-ds/components/index.css";

import "./globals.css";

export const metadata = {
  title: "Leafy Loyalty Store — MongoDB Demo",
  description: "Leafy Loyalty Store: a MongoDB-backed loyalty program demo.",
    icons: [
    {
      url: "/favicon_light.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      url: "/favicon_dark.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
