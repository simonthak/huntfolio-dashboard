import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReportFormFields from "./ReportFormFields";

interface ReportFormProps {
  onSubmit: (data: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      quantity: number;
    }>;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReportForm = ({ onSubmit, onCancel, isSubmitting }: ReportFormProps) => {
  const [formData, setFormData] = useState<any>({
    animals: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.hunt_type_id) {
      toast.error("Please select a hunt type");
      return;
    }

    if (!formData.participant_count || formData.participant_count < 1) {
      toast.error("Please enter a valid number of participants");
      return;
    }

    if (formData.animals.length === 0) {
      toast.error("Please add at least one animal");
      return;
    }

    const invalidAnimal = formData.animals.find((animal: any) => 
      !animal.animal_type_id || !animal.quantity || animal.quantity < 1
    );

    if (invalidAnimal) {
      toast.error("Please fill in all animal details correctly");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ReportFormFields onChange={setFormData} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Report"}
        </Button>
      </div>
    </form>
  );
};

export default ReportForm;