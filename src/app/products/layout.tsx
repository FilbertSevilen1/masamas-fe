import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description: 'Temukan lebih dari 500 jenis material bangunan berkualitas di Masamas. Semen, baja tulangan, batu bata, atap, kayu, dan banyak lagi. Filter berdasarkan kategori dan harga.',
  keywords: ['katalog material bangunan', 'jual semen', 'jual baja tulangan', 'jual batu bata', 'harga material bangunan', 'toko bangunan online'],
  openGraph: {
    title: 'Katalog Produk | Masamas',
    description: 'Temukan lebih dari 500 jenis material bangunan berkualitas di Masamas.',
    url: '/products',
  },
  alternates: { canonical: '/products' },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
