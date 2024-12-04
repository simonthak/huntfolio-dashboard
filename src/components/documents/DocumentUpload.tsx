import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
}

const DocumentUpload = ({ onUpload }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ladda upp dokument</h2>
        </div>
        <div className="flex gap-4">
          <Input
            type="file"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            <Upload className="w-4 h-4 mr-2" />
            Ladda upp
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;