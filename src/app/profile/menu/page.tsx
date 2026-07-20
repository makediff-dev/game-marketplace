import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { ProfileMenu } from "@/components/profile/profile-menu/profile-menu";
import { Footer } from "@/components/footer/footer/footer";

export default function ProfileMenuPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title="Меню профиля" backHref="/profile" />
        </div>
        <ProfileMenu />
        <Footer />
      </div>
    </div>
  );
}
