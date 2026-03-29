import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const GRADE_NAMES = ["Grade-6","Grade-7","Grade-8","Grade-9","Grade-10","Grade-11","Grade-12"];

interface Props { open: boolean; onOpenChange: (open: boolean) => void; batchId: string; }

export const AddGradeDialog = ({ open, onOpenChange, batchId }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ gradeName: "", gradeCode: "", section: "A" });

  const mutation = useMutation({
    mutationFn: () => gradesAPI.create({ batchId, ...form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades", batchId] });
      toast({ title: "Grade created successfully" });
      onOpenChange(false);
      setForm({ gradeName: "", gradeCode: "", section: "A" });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Something went wrong";
      toast({ title: "Failed to create grade", description: message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Grade</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Grade *</Label>
            <Select value={form.gradeName} onValueChange={(v) => setForm((p) => ({ ...p, gradeName: v }))}>
              <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
              <SelectContent>
                {GRADE_NAMES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeCode">Grade Code *</Label>
            <Input id="gradeCode" value={form.gradeCode} onChange={(e) => setForm((p) => ({ ...p, gradeCode: e.target.value.toUpperCase() }))} placeholder="e.g. G10-A" required />
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={form.section} onValueChange={(v) => setForm((p) => ({ ...p, section: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A","B","C","D","E"].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !form.gradeName}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Grade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
