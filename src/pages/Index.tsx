import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import SEOHead from "@/components/SEOHead";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";
import TailoredTripsSection from "@/components/landing/TailoredTripsSection";
import WhatWeProvide from "@/components/landing/WhatWeProvide";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
// Preserved landing sections — re-enable in Index if needed:
// import HowWeOrganize from "@/components/landing/HowWeOrganize";
// import ForWhom from "@/components/landing/ForWhom";
// import OurDestinations from "@/components/landing/OurDestinations";
// import WhyUs from "@/components/landing/WhyUs";
// import LegacyHomeSections from "@/components/landing/LegacyHomeSections";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    const timer = window.setTimeout(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location]);

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Złoty Żółwik",
    description:
      "Organizator jednodniowych wyjazdów dla firm, szkół i grup zorganizowanych. Pełna opieka od A do Z, bez ukrytych kosztów.",
    url: "https://zloty-zolwik.pl",
    telephone: ["514176996"],
    email: "kontakt@zloty-zolwik.pl",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PL",
      addressLocality: "Polska",
    },
    sameAs: ["https://facebook.com/zloty-zolwik", "https://instagram.com/zloty-zolwik"],
    offers: {
      "@type": "Offer",
      category: "Organizacja wyjazdów",
      description: "Jednodniowe wycieczki dla firm, szkół i grup zorganizowanych",
    },
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Złoty Żółwik – Organizator wyjazdów dla firm, szkół i grup"
        description="Organizujemy jednodniowe wyjazdy dla firm, szkół i grup zorganizowanych. Transport, przewodnik, bilety i koordynator w jednej cenie. Bez ukrytych kosztów."
        keywords="organizacja wyjazdów, wycieczki firmowe, wycieczki szkolne, wyjazdy integracyjne, Złoty Żółwik"
        structuredData={homeStructuredData}
        canonicalUrl="https://zloty-zolwik.pl"
      />

      <PublicNav />

      <main role="main">
        <Hero />
        <TailoredTripsSection />
        <WhatWeProvide />
        <Gallery />
        {/* Redundant with TailoredTripsSection — preserved components above */}
        {/* <HowWeOrganize /> */}
        {/* <ForWhom /> */}
        {/* <OurDestinations /> */}
        {/* <WhyUs /> */}
        <Testimonials />
        <FAQ />
        <FinalCTA />
        {/* <LegacyHomeSections /> */}
      </main>

      <PublicFooter />
    </div>
  );
};

export default Index;
