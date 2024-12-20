import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Välkommen till Antler</CardTitle>
          <CardDescription className="text-center">
            Logga in för att fortsätta till din jaktportal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;