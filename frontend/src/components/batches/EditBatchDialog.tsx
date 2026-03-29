import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

interface Batch { _id: string; batchName: string; batchCode: string; description?: string; status?: string; }
interface Props { open: boolean; onOpenChange: (open: boolean) => void; batch: Batch | null; }

export const EditBatchDialog = ({ open, onOpenChange, batch }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ batchName: "", batchCode: "", description: "", status: "upcoming" });

  useEffect(() => {
    if (batch) setForm({ batchName: batch.batchName, batchCode: batch.batchCode, description: batch.description || "", status: batch.status || "upcoming" });
  }, [batch]);

  const mutation = useMutation({
    mutationFn: () => batchesAPI.update(batch!._id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-batches"] });
      toast({ title: "Batch updated successfully" });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.error?.message ?? err.message : "Something went wrong";
      toast({ title: "Failed to update batch", description: message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Batch</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-batchName">Batch Name *</Label>
            <Input id="edit-batchName" value={form.batchName} onChange={(e) => setForm((p) => ({ ...p, batchName: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-batchCode">Batch Code *</Label>
            <Input id="edit-batchCode" value={form.batchCode} onChange={(e) => setForm((p) => ({ ...p, batchCode: e.target.value.toUpperCase() }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
