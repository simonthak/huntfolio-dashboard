import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type ContactType = Database["public"]["Enums"]["contact_type"];

export const contactTypes = [
  { value: "eftersok" as ContactType, label: "Eftersök" },
  { value: "granne" as ContactType, label: "Granne" },
  { value: "markagare" as ContactType, label: "Markägare" },
];

interface ContactFormData {
  name: string;
  contact_type: ContactType;
  note: string;
  phone: string;
  email: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    contact_type: "" as ContactType,
    note: "",
    phone: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Typ</Label>
        <Select
          value={formData.contact_type}
          onValueChange={(value: ContactType) =>
            setFormData({ ...formData, contact_type: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Välj typ" />
          </SelectTrigger>
          <SelectContent>
            {contactTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="note">Anteckning</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) =>
            setFormData({ ...formData, note: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      </div>
      <Button type="submit" className="w-full">
        Spara
      </Button>
    </form>
  );
};

export default ContactForm;