import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  areal_ha: z.number().min(0.01, "Area must be greater than 0"),
});

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      areal_ha: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Starting team creation with values:", values);

      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (!session) {
        toast.error("You must be logged in to create a team");
        return;
      }

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: values.name,
          location: values.location,
          areal_ha: values.areal_ha,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (teamError) {
        console.error('Team creation error:', teamError);
        throw new Error(teamError.message);
      }

      console.log("Team created successfully:", team);

      // Add the creator as a team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id: session.user.id,
        });

      if (memberError) {
        console.error('Team member creation error:', memberError);
        throw new Error(memberError.message);
      }

      console.log("Team member added successfully");
      toast.success("Team created successfully!");
      setOpen(false);
      form.reset();
      window.location.reload();
    } catch (error: any) {
      console.error('Error in team creation:', error);
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create a Team</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Hunting Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areal_ha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (ha)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Enter area in hectares" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}