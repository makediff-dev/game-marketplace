import {
  PaymentResultScreen,
  paymentPageMetadata,
  type TPaymentReturnParams,
} from "@/components/payment-result-screen";

export const metadata = { ...paymentPageMetadata, title: "Оплата не прошла" };

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<TPaymentReturnParams>;
}) {
  return <PaymentResultScreen result="fail" params={await searchParams} />;
}
