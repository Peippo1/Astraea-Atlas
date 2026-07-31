import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "Astraea Atlas — Exoplanet Archive", description: "An animated, educational atlas of confirmed exoplanets from the NASA Exoplanet Archive.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title: "Astraea Atlas", description: "A living atlas of confirmed exoplanet discoveries.", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Astraea Atlas — a living atlas of confirmed exoplanets" }] }, twitter: { card: "summary_large_image", title: "Astraea Atlas", description: "A living atlas of confirmed exoplanet discoveries.", images: ["/og.png"] } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>; }
