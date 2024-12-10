import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
}

const DocumentUpload = ({ onUpload }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ladda upp dokument</h2>
        </div>
        <div className="flex gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            onClick={handleButtonClick}
            variant="outline"
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Välj dokument
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            style={{ backgroundColor: '#13B67F' }}
            className="text-white hover:bg-[#0ea16f]"
          >
            {selectedFile ? selectedFile.name : 'Ladda upp'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;