import type { Metadata } from "next";
import { AppLayout } from "../components/AppLayout";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Awai",
  description: "Japanese Minimalist App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAFAF8]">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
