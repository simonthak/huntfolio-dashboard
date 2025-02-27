import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteDocument } from "./documentOperations";
import { Document } from "./types";

export const useDocuments = (teamId: string | null) => {
  const queryClient = useQueryClient();
  
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

      console.log("Documents fetched:", data);
      return data;
    },
  });

  const handleDownload = async (doc: Document) => {
    try {
      console.log("Starting download for document:", doc.name);
      
      const { data, error } = await supabase.storage
        .from("team_documents")
        .download(doc.file_path);

      if (error) {
        console.error("Download error:", error);
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
      a.download = doc.name;
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

  const handleDelete = async (doc: Document) => {
    try {
      console.log("Starting deletion process for document:", doc.name);

      // Remove from cache immediately for better UX
      queryClient.setQueryData(["team-documents", teamId], (oldData: Document[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(d => d.id !== doc.id);
      });

      // Perform the actual deletion
      await deleteDocument(doc);

      // Force a refetch to ensure our cache is in sync
      await queryClient.invalidateQueries({
        queryKey: ["team-documents", teamId],
        exact: true
      });

      toast.success("Dokument borttaget");
    } catch (error) {
      console.error("Handle delete error:", error);
      // On error, refetch to restore the correct state
      await refetch();
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