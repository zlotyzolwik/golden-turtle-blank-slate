import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEOHead = ({
  title = "Złoty Żółwik - Wycieczki do Polski i Europy | Organizator wycieczek",
  description = "Organizujemy niezapomniane wycieczki po najpiękniejszych zakątkach Polski i Europy od 2008 roku. Profesjonalna obsługa, konkurencyjne ceny. Rezerwuj teraz!",
  keywords = "wycieczki, Polska, Europa, organizator wycieczek, wyjazdy, turystyka, Złoty Żółwik",
  ogImage = "/logo-zloty-zolwik.png",
  ogType = "website",
  canonicalUrl,
  structuredData
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Złoty Żółwik" />
      <meta property="og:locale" content="pl_PL" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;