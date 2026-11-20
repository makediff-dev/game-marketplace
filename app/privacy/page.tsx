import { LegalArticle } from "@/components/legal-article";
import {
  LEGAL_UPDATED_AT,
  PRIVACY_LEAD,
  PRIVACY_SECTIONS,
} from "@/lib/static-content";

export default function PrivacyPage() {
  return (
    <LegalArticle
      title="Политика конфиденциальности"
      lead={PRIVACY_LEAD}
      updatedAt={LEGAL_UPDATED_AT}
      sections={PRIVACY_SECTIONS}
    />
  );
}
