import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  firstname: string;
  lastname: string;
  onAvatarUpdate: (url: string) => void;
}

const ProfileAvatar = ({ avatarUrl, firstname, lastname, onAvatarUpdate }: ProfileAvatarProps) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast.success("Profilbild uppdaterad");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Det gick inte att ladda upp profilbilden");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          {firstname?.[0]?.toUpperCase() || "?"}
          {lastname?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar-upload"
          onChange={handleAvatarUpload}
          disabled={uploadingAvatar}
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById("avatar-upload")?.click()}
          disabled={uploadingAvatar}
        >
          {uploadingAvatar ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Byt bild
        </Button>
      </div>
    </div>
  );
};

export default ProfileAvatar;