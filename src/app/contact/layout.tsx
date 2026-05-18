import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Hubungi tim Masamas untuk konsultasi material bangunan, pemesanan, atau informasi pengiriman. Tersedia Senin–Jumat 08.00–17.00 WIB.',
  keywords: ['kontak masamas', 'hubungi toko bangunan', 'konsultasi material', 'telepon masamas'],
  openGraph: {
    title: 'Hubungi Kami | Masamas',
    description: 'Hubungi tim Masamas untuk konsultasi material bangunan, pemesanan, atau informasi pengiriman.',
    url: '/contact',
  },
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
