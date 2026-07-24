import { redirect } from "next/navigation";

export default function SellStartPage() {
  redirect("/sell?terms=1");
}
