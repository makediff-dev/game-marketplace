import { Navbar } from "@/components/layout/navbar/navbar";
import { ProfileSetupForm } from "@/components/auth/profile-setup-form/profile-setup-form";
import { Footer } from "@/components/footer/footer/footer";

export default function RegisterProfilePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <ProfileSetupForm />
        <Footer />
      </div>
    </div>
  );
}
