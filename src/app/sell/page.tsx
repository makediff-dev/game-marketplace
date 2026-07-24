import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { SellerContent } from "@/components/seller/seller-content/seller-content";
import { Footer } from "@/components/footer/footer/footer";

interface SellPageProps {
  searchParams: Promise<{ terms?: string }>;
}

export default async function SellPage({ searchParams }: SellPageProps) {
  const params = await searchParams;

  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <SellerContent initialTermsOpen={params.terms === "1"} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
