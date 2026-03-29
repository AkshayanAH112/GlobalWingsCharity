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

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  status: string;
  batchId?: { _id: string; batchName: string; batchCode: string } | string;
  gradeId?: { _id: string; gradeName: string; section: string } | string;
}

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function EditStudentDialog({ open, onOpenChange, student }: EditStudentDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "male",
    phone: "",
    status: "active",
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
    if (student) {
      const batchId = typeof student.batchId === "object" && student.batchId ? student.batchId._id : (student.batchId ?? "");
      const gradeId = typeof student.gradeId === "object" && student.gradeId ? student.gradeId._id : (student.gradeId ?? "");
      setFormData({
        firstName: student.firstName ?? "",
        lastName: student.lastName ?? "",
        email: student.email ?? "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
        gender: student.gender ?? "male",
        phone: student.phone ?? "",
        status: student.status ?? "active",
        batchId,
        gradeId,
      });
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, string> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        status: formData.status,
      };
      if (formData.email) payload.email = formData.email;
      if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.batchId) payload.batchId = formData.batchId;
      if (formData.gradeId) payload.gradeId = formData.gradeId;
      return studentsAPI.update(student!._id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Student updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update student" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update details for {student.studentId}</DialogDescription>
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
              <Select value={formData.batchId} onValueChange={(v) => setFormData((p) => ({ ...p, batchId: v, gradeId: "" }))}>
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

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
