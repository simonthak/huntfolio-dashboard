import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocuments = (teamId: string | null) => {
  const { data: documents, refetch } = useQuery({
    queryKey: ["team-documents", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      console.log("Fetching documents for team:", teamId);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      return data;
    },
  });

  const handleDownload = async (docFile: any) => {
    try {
      console.log("Starting download for document:", docFile.name, "Path:", docFile.file_path);
      
      const { data, error } = await supabase.storage
        .from("team_documents")
        .download(docFile.file_path);

      if (error) {
        console.error("Supabase download error:", error);
        toast.error("Fel vid nedladdning av dokument");
        return;
      }

      if (!data) {
        console.error("No data received from download");
        toast.error("Fel vid nedladdning av dokument");
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = docFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Download completed successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Fel vid nedladdning av dokument");
    }
  };

  const handleDelete = async (doc: any) => {
    try {
      console.log("Deleting document:", doc.name);
      
      const { error: storageError } = await supabase.storage
        .from("team_documents")
        .remove([doc.file_path]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        toast.error("Kunde inte ta bort dokumentet");
        return;
      }

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) {
        console.error("Database deletion error:", dbError);
        toast.error("Kunde inte ta bort dokumentet");
        return;
      }

      toast.success("Dokument borttaget");
      refetch();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Kunde inte ta bort dokumentet");
    }
  };

  return {
    documents,
    handleDownload,
    handleDelete,
    refetch,
  };
};