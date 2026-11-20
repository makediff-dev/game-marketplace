import { OrderScreen } from "@/components/order-screen";

// Personal page: no shared caching.
export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderScreen orderId={id} />;
}
