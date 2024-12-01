import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamMembersProps {
  members: {
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
      firstname: string | null;
      lastname: string | null;
      email: string | null;
      phone_number: string | null;
    };
  }[];
}

const TeamMembers = ({ members }: TeamMembersProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Members
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.user_id}>
              <TableCell>
                {member.profiles.firstname} {member.profiles.lastname}
              </TableCell>
              <TableCell>{member.profiles.email}</TableCell>
              <TableCell>{member.profiles.phone_number || '-'}</TableCell>
              <TableCell className="capitalize">{member.role}</TableCell>
              <TableCell>
                {new Date(member.joined_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TeamMembers;