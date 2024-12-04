import { Phone, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  contact_type: "eftersok" | "granne" | "markagare";
  note?: string;
  phone?: string;
  email?: string;
}

const contactTypeLabels = {
  eftersok: "Eftersök",
  granne: "Granne",
  markagare: "Markägare",
};

const contactTypeColors = {
  eftersok: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  granne: "bg-green-100 text-green-800 hover:bg-green-100/80",
  markagare: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
};

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
}

const ContactCard = ({ contact, onDelete }: ContactCardProps) => {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg bg-white">
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">{contact.name}</h3>
          <Badge 
            variant="secondary" 
            className={contactTypeColors[contact.contact_type]}
          >
            {contactTypeLabels[contact.contact_type]}
          </Badge>
        </div>
        {contact.note && (
          <p className="text-sm text-gray-600">{contact.note}</p>
        )}
        <div className="space-y-1">
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {contact.phone}
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {contact.email}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(contact.id)}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
};

export default ContactCard;