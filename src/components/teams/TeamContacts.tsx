import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contactTypes = [
  { value: "eftersok", label: "Eftersök" },
  { value: "granne", label: "Granne" },
  { value: "markagare", label: "Markägare" },
];

interface TeamContactsProps {
  teamId: string;
}

const TeamContacts = ({ teamId }: TeamContactsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_type: "",
    note: "",
    phone: "",
    email: "",
  });

  const { data: contacts, refetch } = useQuery({
    queryKey: ["team-contacts", teamId],
    queryFn: async () => {
      console.log("Fetching contacts for team:", teamId);
      const { data, error } = await supabase
        .from("team_contacts")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("team_contacts").insert({
        team_id: teamId,
        ...formData,
      });

      if (error) throw error;

      toast.success("Kontakt tillagd");
      setIsOpen(false);
      setFormData({
        name: "",
        contact_type: "",
        note: "",
        phone: "",
        email: "",
      });
      refetch();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Kunde inte lägga till kontakt");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("team_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Kontakt borttagen");
      refetch();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Kunde inte ta bort kontakt");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Kontakter</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Lägg till kontakt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till ny kontakt</DialogTitle>
            </DialogHeader>
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
                  onValueChange={(value) =>
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {contacts?.map((contact) => (
          <div
            key={contact.id}
            className="flex items-start justify-between p-4 border rounded-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{contact.name}</h3>
                <span className="text-sm text-gray-500 capitalize">
                  ({contact.contact_type})
                </span>
              </div>
              {contact.note && (
                <p className="text-sm text-gray-600">{contact.note}</p>
              )}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(contact.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        {contacts?.length === 0 && (
          <p className="text-center text-gray-500">Inga kontakter än</p>
        )}
      </div>
    </Card>
  );
};

export default TeamContacts;