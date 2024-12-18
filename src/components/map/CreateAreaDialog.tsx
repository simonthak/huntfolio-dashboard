import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: any;
  type: 'area' | 'pass' | null;
  teamId: string | null;
}

const CreateAreaDialog = ({ 
  open, 
  onOpenChange, 
  feature, 
  type,
  teamId 
}: CreateAreaDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !feature || !type) return;

    setIsSubmitting(true);
    try {
      if (type === 'area') {
        const { error } = await supabase
          .from('drive_areas')
          .insert({
            team_id: teamId,
            name,
            boundary: feature,
          });

        if (error) throw error;
        toast.success('Drevområde skapat');
      } else {
        const { error } = await supabase
          .from('hunting_passes')
          .insert({
            team_id: teamId,
            name,
            location: feature.geometry,
            description,
          });

        if (error) throw error;
        toast.success('Pass skapat');
      }

      // Invalidate queries to refresh the map
      queryClient.invalidateQueries({ queryKey: ['drive-areas'] });
      queryClient.invalidateQueries({ queryKey: ['hunting-passes'] });
      
      onOpenChange(false);
      setName("");
      setDescription("");
    } catch (error) {
      console.error('Error creating area/pass:', error);
      toast.error('Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'area' ? 'Skapa drevområde' : 'Skapa pass'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {type === 'pass' && (
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Spara
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAreaDialog;