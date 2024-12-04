import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Documents = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["team-documents", currentTeamId],
    enabled: !!currentTeamId,
    queryFn: async () => {
      console.log("Fetching documents for team:", currentTeamId);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("team_id", currentTeamId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      return data;
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentTeamId) return;

    try {
      setIsUploading(true);
      console.log("Uploading file:", file.name);

      const filePath = `${currentTeamId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("team_documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from("documents").insert({
        team_id: currentTeamId,
        name: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        uploaded_by: user?.id
      });

      if (dbError) {
        console.error("Error saving document metadata:", dbError);
        throw dbError;
      }

      toast.success("Dokument uppladdad");
      refetch();
    } catch (error) {
      console.error("Error in file upload:", error);
      toast.error("Fel vid uppladdning av dokument");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (docFile: any) => {
    try {
      console.log("Starting download for document:", docFile.name, "Path:", docFile.file_path);
      
      const { data, error } = await supabase.storage
        .from("team_documents")
        .download(docFile.file_path);

      if (error) {
        console.error("Supabase download error:", error);
        throw new Error(`Failed to download: ${error.message}`);
      }

      if (!data) {
        console.error("No data received from download");
        throw new Error("No data received from download");
      }

      console.log("Download successful, creating blob URL");
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
      console.error("Detailed download error:", error);
      toast.error("Fel vid nedladdning av dokument");
    }
  };

  if (!currentTeamId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inget Team Valt</h2>
        <p className="text-gray-600">Vänligen välj ett team för att se dokument</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dokument</h1>
          <p className="text-gray-500 mt-2">Hantera teamets dokument</p>
        </div>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Ladda upp dokument
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#13B67F]" />
        </div>
      ) : documents?.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Inga dokument än</h3>
          <p className="mt-2 text-gray-500">
            Ladda upp ditt första dokument genom att klicka på knappen ovan
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc) => (
            <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(doc.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;