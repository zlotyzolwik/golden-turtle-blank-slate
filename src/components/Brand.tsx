import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Brand = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/')}
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      aria-label="Strona główna Złoty Żółwik"
    >
      <img 
        src={logo} 
        alt="Złoty Żółwik" 
        className="h-10 w-auto object-contain"
      />
      <h1 className="text-2xl font-bold text-primary">Złoty Żółwik</h1>
    </button>
  );
};

export default Brand;