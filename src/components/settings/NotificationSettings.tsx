import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const NotificationSettings = () => {
  const queryClient = useQueryClient();

  // Fetch current user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      console.log("Fetching user settings...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      let { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings don't exist yet, create them
          console.log("No settings found, creating default settings...");
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert([
              { 
                user_id: session.user.id,
                email_notifications: true 
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Error creating user settings:", insertError);
            throw insertError;
          }

          data = newSettings;
        } else {
          console.error("Error fetching user settings:", error);
          throw error;
        }
      }
      
      console.log("User settings:", data);
      return data;
    },
  });

  // Mutation for updating email notifications
  const updateNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log("Updating notifications to:", enabled);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Ingen session');

      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: session.user.id,
          email_notifications: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Error updating notifications:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Notifications updated successfully");
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success("Aviseringsinställningar uppdaterade");
    },
    onError: (error) => {
      console.error("Error updating notifications:", error);
      toast.error("Det gick inte att uppdatera aviseringsinställningarna");
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Aviseringsinställningar</h3>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">E-postaviseringar</h4>
          <p className="text-sm text-gray-500">
            Ta emot e-postaviseringar om viktiga uppdateringar
          </p>
        </div>
        <Switch
          checked={settings?.email_notifications ?? false}
          onCheckedChange={(checked) => {
            console.log("Toggle switch clicked, new value:", checked);
            updateNotificationsMutation.mutate(checked);
          }}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;