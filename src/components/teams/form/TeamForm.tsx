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
              <FormLabel>Lagets namn*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ange lagets namn" />
              </FormControl>
              <FormDescription>
                Välj ett unikt namn för ditt lag
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
              <FormLabel>Plats</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ange lagets plats" />
              </FormControl>
              <FormDescription>
                Var är laget huvudsakligen baserat?
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
              <FormLabel>Beskrivning</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Beskriv ditt lag" />
              </FormControl>
              <FormDescription>
                Lägg till information om lagets syfte och aktiviteter
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
              <FormLabel>Areal (hektar)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.01" 
                  placeholder="Ange area i hektar" 
                />
              </FormControl>
              <FormDescription>
                Storleken på ert jaktområde i hektar
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
              Skapar...
            </>
          ) : (
            "Skapa lag"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TeamForm;