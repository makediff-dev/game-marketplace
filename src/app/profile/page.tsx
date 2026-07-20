import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { ProfileContent } from "@/components/profile/profile-content/profile-content";
import { Footer } from "@/components/footer/footer/footer";
import { mockUser } from "@/lib/mock/user";

export default function ProfilePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title={`Профиль ${mockUser.name}`} menuHref="/profile/menu" />
        </div>
        <ProfileContent />
        <Footer />
      </div>
    </div>
  );
}
