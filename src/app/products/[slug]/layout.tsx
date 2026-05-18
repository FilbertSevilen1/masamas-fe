import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Server-side metadata generation for SEO on product detail pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/products/${params.slug}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return {
        title: 'Produk Tidak Ditemukan',
        description: 'Produk yang Anda cari tidak tersedia di Masamas.',
        robots: { index: false, follow: false },
      };
    }

    const product = await res.json();
    const price = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(Number(product.price));

    return {
      title: product.name,
      description: `Beli ${product.name} di Masamas. Harga ${price}. ${product.description?.slice(0, 120)}. Material bangunan berkualitas dengan pengiriman cepat.`,
      keywords: [product.name, product.category?.name, 'material bangunan', 'masamas', 'toko bangunan'],
      openGraph: {
        title: `${product.name} | Masamas`,
        description: `${product.name} — ${price}. ${product.description?.slice(0, 100)}.`,
        url: `/products/${product.slug}`,
        images: product.thumbnail ? [{ url: product.thumbnail, alt: product.name }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Masamas`,
        description: `${product.name} — ${price}`,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
      alternates: { canonical: `/products/${product.slug}` },
    };
  } catch {
    return { title: 'Produk', description: 'Detail produk Masamas.' };
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
