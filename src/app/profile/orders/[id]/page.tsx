import { notFound } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { CreatedOrderPage } from "@/components/profile/order-detail/created-order-page/created-order-page";
import { OrderDetailContent } from "@/components/profile/order-detail/order-detail-content/order-detail-content";
import { getOrderById, isUserCreatedOrderId } from "@/lib/mock/orders";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  if (isUserCreatedOrderId(id)) {
    return <CreatedOrderPage id={id} />;
  }

  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <OrderDetailContent order={order} />
        <Footer />
      </div>
    </div>
  );
}
