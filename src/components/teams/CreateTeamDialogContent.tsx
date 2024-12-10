import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TeamForm from "./form/TeamForm";
import type { TeamFormValues } from "./form/TeamFormSchema";

interface CreateTeamDialogContentProps {
  onSubmit: (values: TeamFormValues) => Promise<void>;
  isCreating: boolean;
}

const CreateTeamDialogContent = ({ onSubmit, isCreating }: CreateTeamDialogContentProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Skapa nytt jaktlag</DialogTitle>
      </DialogHeader>
      <TeamForm onSubmit={onSubmit} isCreating={isCreating} />
    </>
  );
};

export default CreateTeamDialogContent;