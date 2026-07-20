import { Navbar } from "@/components/layout/navbar/navbar";
import { VerifyCodeForm } from "@/components/auth/verify-code-form/verify-code-form";
import { Footer } from "@/components/footer/footer/footer";

export default function VerifyPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <VerifyCodeForm />
        <Footer />
      </div>
    </div>
  );
}
