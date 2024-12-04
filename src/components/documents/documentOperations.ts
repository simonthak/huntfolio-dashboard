import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Document } from "./types";

export const deleteDocument = async (doc: Document) => {
  console.log("Starting document deletion process for:", doc.name);

  try {
    // Step 1: Delete from database first
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      throw new Error("Database deletion failed");
    }
    console.log("Database record deleted successfully");

    // Step 2: Delete from storage
    const { error: storageError } = await supabase.storage
      .from("team_documents")
      .remove([doc.file_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Even if storage deletion fails, the document is removed from database
      console.warn("Storage deletion failed but database record was removed");
    } else {
      console.log("Storage file deleted successfully");
    }
  } catch (error) {
    console.error("Deletion error:", error);
    throw error;
  }
};