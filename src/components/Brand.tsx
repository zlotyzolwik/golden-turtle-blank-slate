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
        width="40"
        height="40"
        className="h-10 w-10 object-contain block shrink-0"
        loading="eager"
        decoding="sync"
      />
      <h1 className="text-2xl font-bold text-primary leading-none">Złoty Żółwik</h1>
    </button>
  );
};

export default Brand;