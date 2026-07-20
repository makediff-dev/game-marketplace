import { Navbar } from "@/components/layout/navbar/navbar";
import { SellerContent } from "@/components/seller/seller-content/seller-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SellPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <SellerContent />
        <Footer />
      </div>
    </div>
  );
}
