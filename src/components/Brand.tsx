import { useNavigate } from "react-router-dom";

const Brand = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/')}
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      aria-label="Strona główna Złoty Żółwik"
    >
      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
        🐢
      </div>
      <h1 className="text-2xl font-bold text-primary">Złoty Żółwik</h1>
    </button>
  );
};

export default Brand;