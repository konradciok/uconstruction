import { redirect } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  // Redirect to the new product page route
  redirect(`/product/${resolvedParams.handle}`);
}
