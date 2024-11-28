import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserMinus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TeamActionsProps {
  teamId: string;
  userRole: string;
  inviteCode: string;
}

const TeamActions = ({ teamId, userRole, inviteCode }: TeamActionsProps) => {
  const navigate = useNavigate();
  
  const handleLeaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', teamId);

      if (error) throw error;

      toast.success("Successfully left team");
      navigate("/no-team");
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="destructive"
        onClick={handleLeaveTeam}
        className="flex items-center gap-2"
      >
        <UserMinus className="w-4 h-4" />
        Leave Team
      </Button>

      {userRole === 'admin' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#13B67F] hover:bg-[#0ea16f] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Members
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Code</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                Share this invite code with people you want to join your team:
              </p>
              <code className="bg-gray-100 p-2 rounded block text-center">
                {inviteCode}
              </code>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamActions;