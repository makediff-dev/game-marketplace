import { LegalArticle } from "@/components/legal-article";
import {
  LEGAL_UPDATED_AT,
  TERMS_LEAD,
  TERMS_SECTIONS,
} from "@/lib/static-content";

export default function TermsPage() {
  return (
    <LegalArticle
      title="Пользовательское соглашение"
      lead={TERMS_LEAD}
      updatedAt={LEGAL_UPDATED_AT}
      sections={TERMS_SECTIONS}
    />
  );
}
