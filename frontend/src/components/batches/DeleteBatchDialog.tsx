import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Batch {
  _id: string;
  batchName: string;
  batchCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: Batch | null;
}

export const DeleteBatchDialog = ({ open, onOpenChange, batch }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => batchesAPI.delete(batch!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast({ title: "Batch deleted successfully" });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error?.message ?? err.message
        : "Something went wrong";
      toast({ title: "Failed to delete batch", description: message, variant: "destructive" });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Batch</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {batch?.batchName}
            </span>{" "}
            <span className="font-mono text-sm">({batch?.batchCode})</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
