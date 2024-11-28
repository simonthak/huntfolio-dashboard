import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TeamForm from "./form/TeamForm";
import type { TeamFormValues } from "./form/TeamFormSchema";

const CreateTeamDialog = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (values: TeamFormValues) => {
    try {
      setIsCreating(true);
      console.log("Creating team with values:", values);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a team");
        return;
      }

      // First create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: values.name,
          description: values.description || null,
          location: values.location || null,
          areal: values.areal,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) {
        console.error("Error creating team:", teamError);
        throw teamError;
      }

      console.log("Team created successfully:", team);

      // Then add the creator as an admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error("Error adding team member:", memberError);
        throw memberError;
      }

      console.log("Added creator as admin member");
      toast.success("Team created successfully");
      setIsOpen(false);
      navigate("/teams");
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Failed to create team. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#13B67F] hover:bg-[#0ea16f]">
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <TeamForm onSubmit={handleSubmit} isCreating={isCreating} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;