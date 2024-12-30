import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  inviteCode: z.string().min(1, "Inbjudningskod krävs"),
});

type FormData = z.infer<typeof formSchema>;

interface JoinTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinTeamDialog = ({ open, onOpenChange }: JoinTeamDialogProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      console.log("Joining team with invite code:", data.inviteCode);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        console.error("No authenticated user found");
        toast.error("Du måste vara inloggad för att gå med i ett lag");
        return;
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("invite_code", data.inviteCode)
        .single();

      if (teamError) {
        console.error("Error finding team:", teamError);
        toast.error("Ogiltig inbjudningskod");
        return;
      }

      if (!team) {
        toast.error("Inget lag hittades med denna kod");
        return;
      }

      const { error: joinError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "member",
        });

      if (joinError) {
        console.error("Error joining team:", joinError);
        if (joinError.code === "23505") {
          toast.error("Du är redan medlem i detta lag");
        } else {
          toast.error("Ett fel uppstod när du försökte gå med i laget");
        }
        return;
      }

      console.log("Successfully joined team:", team.name);
      toast.success(`Du har gått med i ${team.name}`);
      onOpenChange(false);
      navigate(`/?team=${team.id}`);
    } catch (error) {
      console.error("Error in join team process:", error);
      toast.error("Ett fel uppstod när du försökte gå med i laget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gå med i ett lag</DialogTitle>
          <DialogDescription>
            Ange inbjudningskoden du fått från laget för att gå med.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inbjudningskod</FormLabel>
                  <FormControl>
                    <Input placeholder="Ange kod..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Går med..." : "Gå med"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTeamDialog;