import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { teamFormSchema, TeamFormValues } from "./TeamFormSchema";

interface TeamFormProps {
  onSubmit: (values: TeamFormValues) => Promise<void>;
  isCreating: boolean;
}

const TeamForm = ({ onSubmit, isCreating }: TeamFormProps) => {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      areal: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter team name" />
              </FormControl>
              <FormDescription>
                Choose a unique name for your team
              </FormDescription>
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
                <Input {...field} placeholder="Enter team location" />
              </FormControl>
              <FormDescription>
                Where is your team primarily based?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe your team" />
              </FormControl>
              <FormDescription>
                Add some details about your team's purpose and activities
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="areal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Areal (hectares)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.01" 
                  placeholder="Enter area in hectares" 
                />
              </FormControl>
              <FormDescription>
                The size of your hunting area in hectares
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isCreating}
          className="w-full bg-[#13B67F] hover:bg-[#0ea16f]"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Team"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TeamForm;