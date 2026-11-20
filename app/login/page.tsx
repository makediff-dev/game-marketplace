import { AuthScreen } from "@/components/auth-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ vk?: string }>;
}) {
  const { vk } = await searchParams;

  return <AuthScreen vkError={vk} />;
}
