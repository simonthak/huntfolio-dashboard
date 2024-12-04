import { Card } from "@/components/ui/card";
import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "./types";

interface DocumentListProps {
  documents: Document[];
  onDownload: (doc: Document) => Promise<void>;
  onDelete: (doc: Document) => Promise<void>;
}

const DocumentList = ({ documents, onDownload, onDelete }: DocumentListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {documents?.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-6 h-6 text-gray-500" />
              <div>
                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(doc.size)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(doc)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(doc)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {documents?.length === 0 && (
        <p className="text-center text-gray-500">Inga dokument än</p>
      )}
    </div>
  );
};

export default DocumentList;