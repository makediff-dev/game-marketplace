import { Navbar } from "@/components/layout/navbar/navbar";
import { AuthForm } from "@/components/auth/auth-form/auth-form";
import { Footer } from "@/components/footer/footer/footer";

export default function RegisterPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <AuthForm />
        <Footer />
      </div>
    </div>
  );
}
