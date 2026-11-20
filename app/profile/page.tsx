import { Suspense } from "react";

import { ProfileScreen } from "@/components/profile-screen";
import { ProfilePageSkeleton } from "@/components/skeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfileScreen />
    </Suspense>
  );
}
