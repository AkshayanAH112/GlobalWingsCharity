import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subject { _id: string; subjectName: string; }
interface Props { open: boolean; onOpenChange: (open: boolean) => void; subject: Subject | null; }

export const DeleteSubjectDialog = ({ open, onOpenChange, subject }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => subjectsAPI.delete(subject!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-subjects"] });
      toast({ title: "Subject deleted successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to delete subject", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Subject</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">{subject?.subjectName}</span>? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
