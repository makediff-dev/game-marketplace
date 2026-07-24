import { AuthPageShell } from "@/components/auth/auth-page-shell/auth-page-shell";

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnUrl } = await searchParams;

  return <AuthPageShell mode="login" returnUrl={returnUrl} />;
}
