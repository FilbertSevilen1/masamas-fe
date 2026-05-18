import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kategori Produk',
  description: 'Jelajahi semua kategori material bangunan Masamas. Temukan semen & beton, baja tulangan, batu bata, material atap, kayu, dan berbagai kategori konstruksi lainnya.',
  keywords: ['kategori material bangunan', 'kategori semen', 'kategori baja', 'kategori atap', 'jenis material konstruksi'],
  openGraph: {
    title: 'Kategori Produk | Masamas',
    description: 'Jelajahi semua kategori material bangunan Masamas.',
    url: '/categories',
  },
  alternates: { canonical: '/categories' },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
