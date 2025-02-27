import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const LogoHeader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const logoUrl = "https://nlxlpxddixvieiwsxdbu.supabase.co/storage/v1/object/public/logos/symbol.svg?t=2024-12-19T15%3A39%3A32.547Z";

  // Simulate loading to ensure the logo is ready
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.src = logoUrl;
  }, []);

  return (
    <div className="flex items-center justify-start gap-2 mb-6 pl-4">
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      ) : (
        <img src={logoUrl} alt="Antlers logo" className="w-6 h-6" />
      )}
      <span className="text-2xl font-semibold text-gray-900">Antlers</span>
    </div>
  );
};

export default LogoHeader;