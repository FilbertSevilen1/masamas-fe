import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Masamas telah melayani proyek konstruksi skala kecil hingga besar selama lebih dari 15 tahun. Material bangunan berkualitas SNI dengan pengiriman ke seluruh Jakarta.',
  keywords: ['tentang masamas', 'distributor material bangunan', 'toko bangunan jakarta', 'material konstruksi'],
  openGraph: {
    title: 'Tentang Kami | Masamas',
    description: 'Masamas telah melayani proyek konstruksi skala kecil hingga besar selama lebih dari 15 tahun.',
    url: '/about',
  },
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
