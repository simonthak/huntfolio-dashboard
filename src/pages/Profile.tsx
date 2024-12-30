import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileForm from "@/components/profile/ProfileForm";

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState({
    firstname: "",
    lastname: "",
    phone_number: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setDefaultValues({
            firstname: profile.firstname || "",
            lastname: profile.lastname || "",
            phone_number: profile.phone_number || "",
          });
          setAvatarUrl(profile.avatar_url);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Det gick inte att ladda profilen");
      }
    };

    loadProfile();
  }, [navigate]);

  const onSubmit = async (values: typeof defaultValues) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          firstname: values.firstname,
          lastname: values.lastname,
          phone_number: values.phone_number,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Profilen har uppdaterats");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Det gick inte att uppdatera profilen");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Profilinställningar</h1>
      
      <Card>
        <CardContent className="pt-6">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            firstname={defaultValues.firstname}
            lastname={defaultValues.lastname}
            onAvatarUpdate={setAvatarUrl}
          />
          <ProfileForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;