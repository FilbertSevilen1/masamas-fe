import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Masamas Anda untuk mengakses keranjang belanja, riwayat pesanan, dan melanjutkan pembelian material bangunan.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Masuk | Masamas',
    description: 'Masuk ke akun Masamas Anda.',
    url: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
