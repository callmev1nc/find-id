import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find ID — Facebook chat opener",
  description:
    "Search customer chats and open them straight in Meta Business Inbox",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
