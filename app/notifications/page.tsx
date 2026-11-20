import { redirect } from "next/navigation";

// Notifications live in the header dropdown; old links land on the home page.
export default function NotificationsPage() {
  redirect("/");
}
