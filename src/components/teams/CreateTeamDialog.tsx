import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTeamDialogContent from "./CreateTeamDialogContent";
import { useCreateTeam } from "@/hooks/useCreateTeam";
import type { TeamFormValues } from "./form/TeamFormSchema";

const CreateTeamDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { createTeam, isCreating } = useCreateTeam();

  const handleSubmit = async (values: TeamFormValues) => {
    const team = await createTeam(values);
    if (team) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#13B67F] hover:bg-[#0ea16f]">
          <Plus className="w-4 h-4 mr-2" />
          Skapa lag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CreateTeamDialogContent 
          onSubmit={handleSubmit}
          isCreating={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;