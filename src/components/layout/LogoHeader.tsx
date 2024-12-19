import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LogoHeader = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        console.log("Fetching logo from Supabase storage...");
        const { data: { publicUrl }, error } = supabase.storage
          .from('logos')
          .getPublicUrl('antlers-logo.png');

        if (error) {
          console.error("Error fetching logo:", error);
          setIsLoading(false);
          return;
        }

        console.log("Logo URL fetched:", publicUrl);
        setLogoUrl(publicUrl);
      } catch (error) {
        console.error("Unexpected error fetching logo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return (
    <div className="flex items-center gap-2 mb-6">
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      ) : (
        logoUrl && <img src={logoUrl} alt="Antlers logo" className="w-8 h-8" />
      )}
      <span className="text-xl font-semibold text-gray-900">Antlers</span>
    </div>
  );
};

export default LogoHeader;