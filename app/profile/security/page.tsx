import { redirect } from "next/navigation";

// The page was removed; old links land on the profile.
export default function SecurityPage() {
  redirect("/profile");
}
