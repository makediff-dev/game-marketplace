import { AuthPageShell } from "@/components/auth/auth-page-shell/auth-page-shell";

interface RegisterPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { returnUrl } = await searchParams;

  return <AuthPageShell mode="register" returnUrl={returnUrl} />;
}
