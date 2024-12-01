import { Loader2 } from "lucide-react";

const TeamLoading = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default TeamLoading;