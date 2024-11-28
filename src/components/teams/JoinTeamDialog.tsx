import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface JoinTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinTeamDialog = ({ open, onOpenChange }: JoinTeamDialogProps) => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter a team code");
      return;
    }

    try {
      setIsJoining(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to join a team");
        return;
      }

      // First, find the team with the given invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode.trim())
        .single();

      if (teamError || !team) {
        toast.error("Invalid team code");
        return;
      }

      // Check if user is already a member of this team
      const { data: existingMembership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        toast.error("You are already a member of this team");
        return;
      }

      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error("Error checking team membership:", membershipError);
        toast.error("Failed to check team membership");
        return;
      }

      // Join the team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast.success("Successfully joined team");
      onOpenChange(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter team code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleJoinTeam}
            disabled={isJoining}
            className="w-full bg-[#13B67F] hover:bg-[#0ea16f]"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Team"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTeamDialog;