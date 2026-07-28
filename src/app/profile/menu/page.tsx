import { redirect } from "next/navigation";

export default function ProfileMenuPage() {
  redirect("/profile?menu=1");
}
