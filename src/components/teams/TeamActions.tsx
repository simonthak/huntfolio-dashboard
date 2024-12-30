import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMinus, Users, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamActionsProps {
  teamId: string;
  userRole: string;
  inviteCode: string;
  teamName: string;
}

const TeamActions = ({ teamId, userRole, inviteCode, teamName }: TeamActionsProps) => {
  const navigate = useNavigate();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  
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

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-team-invite', {
        body: {
          to: inviteEmail,
          teamName,
          inviteCode,
        },
      });

      if (error) throw error;

      toast.success("Invitation sent successfully");
      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSending(false);
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
        Lämna lag
      </Button>

      {userRole === 'admin' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#13B67F] hover:bg-[#0ea16f] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Bjud in
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bjud in medlemmar</DialogTitle>
              <DialogDescription>
                Dela inbjudningskoden eller skicka en inbjudan via e-post
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Kod</TabsTrigger>
                <TabsTrigger value="email">E-post</TabsTrigger>
              </TabsList>
              <TabsContent value="code">
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Dela denna inbjudningskod:
                  </p>
                  <code className="bg-gray-100 p-2 rounded block text-center">
                    {inviteCode}
                  </code>
                </div>
              </TabsContent>
              <TabsContent value="email">
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="email"
                      placeholder="E-postadress"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#13B67F] hover:bg-[#0ea16f]"
                    disabled={isSending}
                  >
                    {isSending ? (
                      "Skickar..."
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Skicka inbjudan
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamActions;