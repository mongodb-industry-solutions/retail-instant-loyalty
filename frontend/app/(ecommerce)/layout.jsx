import Navbar from "@/components/Navbar/Navbar";

export const metadata = {
  title: "Instant Loyalty",
  description: "",
};

export default function BrandAmplificationLayout({ children }) {

  return (
    <main>
      <Navbar/>
      {children}
    </main>
  );
}
