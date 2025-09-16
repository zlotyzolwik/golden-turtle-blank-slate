const Hero = () => {
  return <section className="relative h-screen flex items-center justify-center" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
    }} role="img" aria-label="Piękny krajobraz górski - tło strony głównej" />
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
        <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold leading-tight">Podróżuj ze Złotym Żółwikiem</h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto">
          Niezapomniane wycieczki po najpiękniejszych zakątkach Europy. 
          Profesjonalna obsługa, najwyższa jakość, dostępne ceny.
        </p>
      </div>
    </section>;
};
export default Hero;