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
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const emailFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user settings
  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Form for email
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for password
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Mutation for updating email notifications
  const updateNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('user_settings')
        .update({ email_notifications: enabled })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification preferences");
    },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsEmailLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: values.email,
      });
      
      if (error) throw error;

      toast.success("Email update request sent. Please check your inbox.");
      emailForm.reset();
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(error.message || "Failed to update email");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-8">
          {/* Email Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Update Email Address</h3>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Email</FormLabel>
                      <FormControl>
                        <Input placeholder="New email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isEmailLoading} className="bg-[#13B67F] hover:bg-[#0ea16f]">
                  {isEmailLoading ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Password Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="New password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPasswordLoading} className="bg-[#13B67F] hover:bg-[#0ea16f]">
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive email notifications about important updates
                </p>
              </div>
              <Switch
                checked={settings?.email_notifications || false}
                onCheckedChange={(checked) => updateNotificationsMutation.mutate(checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;