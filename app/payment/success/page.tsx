import {
  PaymentResultScreen,
  paymentPageMetadata,
  type TPaymentReturnParams,
} from "@/components/payment-result-screen";

export const metadata = { ...paymentPageMetadata, title: "Оплата прошла" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<TPaymentReturnParams>;
}) {
  return <PaymentResultScreen result="success" params={await searchParams} />;
}
