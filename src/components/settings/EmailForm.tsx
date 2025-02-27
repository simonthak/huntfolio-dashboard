import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const emailFormSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
});

const EmailForm = () => {
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsEmailLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: values.email,
      });
      
      if (error) throw error;

      toast.success("E-postuppdateringsförfrågan skickad. Kontrollera din inkorg.");
      emailForm.reset();
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(error.message || "Det gick inte att uppdatera e-postadressen");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Uppdatera e-postadress</h3>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ny e-postadress</FormLabel>
                <FormControl>
                  <Input placeholder="Ny e-postadress" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isEmailLoading} className="bg-[#13B67F] hover:bg-[#0ea16f]">
            {isEmailLoading ? "Uppdaterar..." : "Uppdatera e-post"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmailForm;