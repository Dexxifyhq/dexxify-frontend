import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/products/ProductPage";
import { PRODUCTS } from "@/lib/content/products";

/**
 * /products?tab=<slug>, as on getanchor.co/products?tab=accounts. One page;
 * the tab picks which entry of lib/content/products.ts it shows. No tab shows
 * the first product. A tab with no content yet (swap, payouts, invoices) is a
 * 404 until its entry is added.
 */

type Props = { searchParams: Promise<{ tab?: string | string[] }> };

async function findProduct(searchParams: Props["searchParams"]) {
  const { tab } = await searchParams;
  const slug = Array.isArray(tab) ? tab[0] : tab;
  if (!slug) return PRODUCTS[0];
  return PRODUCTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const product = await findProduct(searchParams);
  if (!product) return {};
  return {
    title: product.meta.title,
    description: product.meta.description,
    alternates: { canonical: `/products?tab=${product.slug}` },
  };
}

export default async function Page({ searchParams }: Props) {
  const product = await findProduct(searchParams);
  if (!product) notFound();
  // All products go to the client, so tabs switch in place without a reload.
  return <ProductPage products={PRODUCTS} initialSlug={product.slug} />;
}
