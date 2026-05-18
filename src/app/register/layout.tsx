import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun',
  description: 'Buat akun Masamas gratis dan mulai belanja material bangunan berkualitas. Nikmati kemudahan pemesanan, tracking pengiriman, dan riwayat transaksi.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Daftar Akun | Masamas',
    description: 'Buat akun Masamas gratis.',
    url: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
