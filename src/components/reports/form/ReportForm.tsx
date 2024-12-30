import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReportFormFields from "./ReportFormFields";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportFormProps {
  initialData?: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      animal_sub_subtype_id?: number;
      quantity: number;
    }>;
  };
  onSubmit: (data: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      animal_sub_subtype_id?: number;
      quantity: number;
    }>;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReportForm = ({ initialData, onSubmit, onCancel, isSubmitting }: ReportFormProps) => {
  const [formData, setFormData] = useState<any>(initialData || {
    animals: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error("Vänligen välj ett datum");
      return;
    }

    if (!formData.hunt_type_id) {
      toast.error("Vänligen välj en jakttyp");
      return;
    }

    if (!formData.participant_count || formData.participant_count < 1) {
      toast.error("Vänligen ange ett giltigt antal deltagare");
      return;
    }

    if (formData.animals.length > 0) {
      const invalidAnimal = formData.animals.find((animal: any) => 
        !animal.animal_type_id || !animal.quantity || animal.quantity < 1
      );

      if (invalidAnimal) {
        toast.error("Vänligen fyll i alla djurdetaljer korrekt");
        return;
      }
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScrollArea className="h-[60vh] pr-4">
        <ReportFormFields onChange={setFormData} initialData={initialData} />
      </ScrollArea>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          style={{ backgroundColor: '#13B67F' }}
        >
          {isSubmitting ? "Sparar..." : initialData ? "Spara ändringar" : "Skapa rapport"}
        </Button>
      </div>
    </form>
  );
};

export default ReportForm;