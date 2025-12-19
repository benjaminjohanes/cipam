import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProfessionalsSection } from "@/components/home/ProfessionalsSection";
import { FormationsSection } from "@/components/home/FormationsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProfessionalsSection />
        <FormationsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
