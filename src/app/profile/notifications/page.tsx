import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { NotificationSettingsContent } from "@/components/profile/notification-settings-content/notification-settings-content";
import { Footer } from "@/components/footer/footer/footer";

export default function NotificationSettingsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PageHeader title="Настройки уведомлений" backHref="/profile" />
        </div>
        <NotificationSettingsContent />
        <Footer />
      </div>
    </div>
  );
}
