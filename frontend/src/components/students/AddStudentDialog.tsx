import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsAPI, batchesAPI, gradesAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "male",
    phone: "",
    batchId: "",
    gradeId: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches } = useQuery({
    queryKey: ["batches-all"],
    queryFn: async () => {
      const res = await batchesAPI.getAll({ limit: 200 });
      return res.data.data ?? [];
    },
    enabled: open,
  });

  const { data: grades } = useQuery({
    queryKey: ["grades-for-batch", formData.batchId],
    queryFn: async () => {
      const res = await gradesAPI.getAll({ batchId: formData.batchId, limit: 100 });
      return res.data.data ?? [];
    },
    enabled: !!formData.batchId,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, gradeId: "" }));
  }, [formData.batchId]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload: Record<string, string> = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
      };
      if (data.email) payload.email = data.email;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (data.phone) payload.phone = data.phone;
      if (data.batchId) payload.batchId = data.batchId;
      if (data.gradeId) payload.gradeId = data.gradeId;
      return studentsAPI.create(payload as Parameters<typeof studentsAPI.create>[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Student added successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to add student" });
    },
  });

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", dateOfBirth: "", gender: "Male", phone: "", batchId: "", gradeId: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Student ID will be auto-generated.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={formData.batchId} onValueChange={(v) => setFormData((p) => ({ ...p, batchId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select batch (optional)" /></SelectTrigger>
                <SelectContent>
                  {batches?.map((b: { _id: string; batchName: string; batchCode: string }) => (
                    <SelectItem key={b._id} value={b._id}>{b.batchName} ({b.batchCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.batchId && (
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={formData.gradeId} onValueChange={(v) => setFormData((p) => ({ ...p, gradeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select grade (optional)" /></SelectTrigger>
                  <SelectContent>
                    {grades?.length ? (
                      grades.map((g: { _id: string; gradeName: string; section: string }) => (
                        <SelectItem key={g._id} value={g._id}>{g.gradeName}  Section {g.section}</SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No grades in this batch</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Optional" />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
