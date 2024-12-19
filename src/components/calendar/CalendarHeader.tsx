import { Users } from "lucide-react";

interface CalendarHeaderProps {
  title: string;
  description: string;
}

const CalendarHeader = ({ title, description }: CalendarHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Jaktkalender</h1>
      <p className="text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export default CalendarHeader;