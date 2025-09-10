import { useNavigate } from "react-router-dom";

const Brand = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/')}
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      aria-label="Strona główna Złoty Żółwik"
    >
      <img 
        src="/lovable-uploads/a27c4817-15d6-48be-941e-7b8c03441f76.png" 
        alt="Złoty Żółwik logo" 
        className="h-10 w-auto object-contain"
      />
      <h1 className="text-2xl font-bold text-primary">Złoty Żółwik</h1>
    </button>
  );
};

export default Brand;