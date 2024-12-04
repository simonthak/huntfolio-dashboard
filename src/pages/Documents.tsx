import { useSearchParams } from "react-router-dom";
import { NoTeamSelected } from "./Reports/NoTeamSelected";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DocumentList from "@/components/documents/DocumentList";
import DocumentUpload from "@/components/documents/DocumentUpload";
import { useDocuments } from "@/components/documents/useDocuments";

const Documents = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const { documents, handleDownload, handleDelete, refetch } = useDocuments(currentTeamId);

  const handleUpload = async (file: File) => {
    try {
      console.log("Starting upload for file:", file.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        toast.error("Du måste vara inloggad för att ladda upp dokument");
        return;
      }

      const filePath = `${currentTeamId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("team_documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Kunde inte ladda upp dokumentet");
        return;
      }

      const { error: dbError } = await supabase.from("documents").insert({
        team_id: currentTeamId,
        name: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        uploaded_by: user.id,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Kunde inte spara dokumentinformation");
        return;
      }

      toast.success("Dokument uppladdat");
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Kunde inte ladda upp dokumentet");
    }
  };

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dokument</h1>
      <DocumentUpload onUpload={handleUpload} />
      <DocumentList 
        documents={documents || []}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Documents;