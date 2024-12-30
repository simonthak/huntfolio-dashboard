import EmailForm from "@/components/settings/EmailForm";
import PasswordForm from "@/components/settings/PasswordForm";
import NotificationSettings from "@/components/settings/NotificationSettings";

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Inställningar</h2>
        <div className="space-y-8">
          <EmailForm />
          <PasswordForm />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;