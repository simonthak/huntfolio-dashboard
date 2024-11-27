import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportFormProps {
  onSubmit: (data: {
    hunt_type_id: number;
    animal_type_id: number;
    animal_subtype_id?: number;
    date: Date;
    quantity: number;
    participant_count: number;
    description?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReportForm = ({ onSubmit, onCancel, isSubmitting }: ReportFormProps) => {
  const [date, setDate] = useState<Date>();
  const [huntTypeId, setHuntTypeId] = useState<string>("");
  const [animalTypeId, setAnimalTypeId] = useState<string>("");
  const [animalSubtypeId, setAnimalSubtypeId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [description, setDescription] = useState("");
  
  const [huntTypes, setHuntTypes] = useState<any[]>([]);
  const [animalTypes, setAnimalTypes] = useState<any[]>([]);
  const [animalSubtypes, setAnimalSubtypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchHuntTypes = async () => {
      const { data, error } = await supabase
        .from('hunt_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching hunt types:', error);
        toast.error('Failed to load hunt types');
        return;
      }
      setHuntTypes(data);
    };

    const fetchAnimalTypes = async () => {
      const { data, error } = await supabase
        .from('animal_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching animal types:', error);
        toast.error('Failed to load animal types');
        return;
      }
      setAnimalTypes(data);
    };

    fetchHuntTypes();
    fetchAnimalTypes();
  }, []);

  useEffect(() => {
    const fetchAnimalSubtypes = async () => {
      if (!animalTypeId) {
        setAnimalSubtypes([]);
        return;
      }

      const { data, error } = await supabase
        .from('animal_subtypes')
        .select('*')
        .eq('animal_type_id', animalTypeId)
        .order('name');
      
      if (error) {
        console.error('Error fetching animal subtypes:', error);
        toast.error('Failed to load animal subtypes');
        return;
      }
      setAnimalSubtypes(data);
      setAnimalSubtypeId("");
    };

    fetchAnimalSubtypes();
  }, [animalTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!huntTypeId) {
      toast.error("Please select a hunt type");
      return;
    }

    if (!animalTypeId) {
      toast.error("Please select an animal type");
      return;
    }

    const qtyNum = parseInt(quantity);
    if (!quantity || qtyNum < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const participantNum = parseInt(participantCount);
    if (!participantCount || participantNum < 1) {
      toast.error("Please enter a valid number of participants");
      return;
    }

    await onSubmit({
      hunt_type_id: parseInt(huntTypeId),
      animal_type_id: parseInt(animalTypeId),
      animal_subtype_id: animalSubtypeId ? parseInt(animalSubtypeId) : undefined,
      date,
      quantity: qtyNum,
      participant_count: participantNum,
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Hunt Type</Label>
        <Select value={huntTypeId} onValueChange={setHuntTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select hunt type" />
          </SelectTrigger>
          <SelectContent>
            {huntTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Animal Type</Label>
        <Select value={animalTypeId} onValueChange={setAnimalTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select animal type" />
          </SelectTrigger>
          <SelectContent>
            {animalTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {animalSubtypes.length > 0 && (
        <div className="space-y-2">
          <Label>Animal Subtype (Optional)</Label>
          <Select value={animalSubtypeId} onValueChange={setAnimalSubtypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select animal subtype" />
            </SelectTrigger>
            <SelectContent>
              {animalSubtypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          placeholder="Enter quantity"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participantCount">Number of Participants</Label>
        <Input
          id="participantCount"
          type="number"
          min="1"
          value={participantCount}
          onChange={(e) => setParticipantCount(e.target.value)}
          required
          placeholder="Enter number of participants"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about the hunt..."
          rows={3}
        />
      </div>

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