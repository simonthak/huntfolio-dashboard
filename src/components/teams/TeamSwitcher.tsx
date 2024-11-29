import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import JoinTeamDialog from "./JoinTeamDialog";

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Select a team
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setShowJoinDialog(true);
                }}
              >
                Join a Team
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      <JoinTeamDialog 
        open={showJoinDialog} 
        onOpenChange={setShowJoinDialog} 
      />
    </>
  );
}