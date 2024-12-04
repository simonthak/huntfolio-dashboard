import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";

interface TeamContactsProps {
  teamId: string;
}

const TeamContacts = ({ teamId }: TeamContactsProps) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSubmit = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("team_contacts").insert({
        team_id: teamId,
        created_by: user.id,
        ...formData,
      });

      if (error) throw error;

      toast.success("Kontakt tillagd");
      setIsOpen(false);
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
            <ContactForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {contacts?.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onDelete={handleDelete}
          />
        ))}
        {contacts?.length === 0 && (
          <p className="text-center text-gray-500">Inga kontakter än</p>
        )}
      </div>
    </Card>
  );
};

export default TeamContacts;