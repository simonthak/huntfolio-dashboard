import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  firstname: z.string().min(2, "Förnamn måste vara minst 2 tecken"),
  lastname: z.string().min(2, "Efternamn måste vara minst 2 tecken"),
  phone_number: z.string().min(10, "Telefonnummer måste vara minst 10 tecken"),
});

interface ProfileFormProps {
  defaultValues: z.infer<typeof formSchema>;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

const ProfileForm = ({ defaultValues, onSubmit }: ProfileFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="firstname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Förnamn</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efternamn</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefonnummer</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Spara ändringar
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;