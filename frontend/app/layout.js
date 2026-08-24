import Providers from "@/components/LeafyProvider/Providers";
import "./globals.css";

export const metadata = {
  title: "Leafy Loyalty Store — MongoDB Demo",
  description: "Leafy Loyalty Store: a MongoDB-backed loyalty program demo.",
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
