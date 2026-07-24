import Link from "next/link";

interface FooterSupportLinkProps {
  className?: string;
}

export function FooterSupportLink({ className }: FooterSupportLinkProps) {
  return (
    <Link href="/support" className={className}>
      Поддержка
    </Link>
  );
}
