import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const empty = { subjectName: "", subjectCode: "", description: "", category: "Core" };

export const AddSubjectDialog = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);

  const mutation = useMutation({
    mutationFn: () => subjectsAPI.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-subjects"] });
      toast({ title: "Subject created successfully" });
      onOpenChange(false);
      setForm(empty);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error?.message ?? err.message
        : "Something went wrong";
      toast({ title: "Failed to create subject", description: message, variant: "destructive" });
    },
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Subject Name *</Label>
            <Input value={form.subjectName} onChange={set("subjectName")} placeholder="e.g. Mathematics" required />
          </div>
          <div className="space-y-2">
            <Label>Subject Code *</Label>
            <Input
              value={form.subjectCode}
              onChange={(e) => setForm((p) => ({ ...p, subjectCode: e.target.value.toUpperCase() }))}
              placeholder="e.g. MATH101"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Elective">Elective</SelectItem>
                <SelectItem value="Practical">Practical</SelectItem>
                <SelectItem value="Theory">Theory</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={set("description")} placeholder="Optional description..." rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
