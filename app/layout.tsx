import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin", "cyrillic"] });
const lora = Lora({ variable: "--font-serif", subsets: ["latin", "cyrillic"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "Корени — семейна памет";
  const description = "Сигурно място за родословието, историите и здравната памет на цялото семейство.";
  return { title, description, openGraph: { title, description, images: [image], locale: "bg_BG", type: "website" }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${geist.variable} ${lora.variable}`}>{children}</body>
    </html>
  );
}
