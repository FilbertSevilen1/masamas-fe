import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Masamas — Material Bangunan Berkualitas Tinggi',
    template: '%s | Masamas',
  },
  description: 'Masamas menyediakan material bangunan berkualitas tinggi untuk proyek konstruksi industri dan residensial. Semen, baja, batu bata, atap, dan lebih dari 500 produk tersedia.',
  keywords: ['material bangunan', 'toko bangunan', 'semen', 'baja tulangan', 'bata', 'atap', 'konstruksi', 'masamas', 'jakarta'],
  authors: [{ name: 'Masamas Store' }],
  creator: 'Masamas Store',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Masamas',
    title: 'Masamas — Material Bangunan Berkualitas Tinggi',
    description: 'Penyedia material bangunan terpercaya untuk proyek konstruksi industri dan residensial di Indonesia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masamas — Material Bangunan Berkualitas Tinggi',
    description: 'Penyedia material bangunan terpercaya untuk proyek konstruksi industri dan residensial di Indonesia.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
