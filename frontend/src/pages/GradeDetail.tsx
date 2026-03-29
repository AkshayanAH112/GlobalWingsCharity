import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradesAPI, studentsAPI, subjectsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Upload, Download, Trash2, Loader2, Users, BookOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from "xlsx";

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  category?: string;
}

interface GradeDetail {
  _id: string;
  gradeName: string;
  gradeCode: string;
  section: string;
  status: string;
  maxStudents: number;
  currentStudents?: number;
  availableSlots?: number;
  students?: Student[];
  subjects?: Subject[];
  batch?: { batchName: string; batchCode: string };
}

const GradeDetail = () => {
  const { batchId, gradeId } = useParams<{ batchId: string; gradeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Fetch grade details
  const { data: grade, isLoading } = useQuery<GradeDetail>({
    queryKey: ["grade", gradeId],
    queryFn: async () => {
      const res = await gradesAPI.getById(gradeId!);
      return res.data.data ?? res.data;
    },
    enabled: !!gradeId,
  });

  // Fetch all students (for picker)
  const { data: allStudents } = useQuery<Student[]>({
    queryKey: ["students-all"],
    queryFn: async () => {
      const res = await studentsAPI.getAll({ limit: 500 });
      return res.data.data ?? [];
    },
    enabled: addStudentOpen,
  });

  // Fetch all subjects (for picker)
  const { data: allSubjects } = useQuery<Subject[]>({
    queryKey: ["subjects-all"],
    queryFn: async () => {
      const res = await subjectsAPI.getAll({ limit: 500 });
      const d = res.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d.data)) return d.data;
      return [];
    },
    enabled: addSubjectOpen,
  });

  // Assign students mutation
  const assignStudents = useMutation({
    mutationFn: () => gradesAPI.assignStudents(gradeId!, selectedStudentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grade", gradeId] });
      toast({ title: "Students assigned successfully" });
      setAddStudentOpen(false);
      setSelectedStudentIds([]);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Error";
      toast({ title: "Failed to assign students", description: message, variant: "destructive" });
    },
  });

  // Assign subjects mutation
  const assignSubjects = useMutation({
    mutationFn: () => gradesAPI.assignSubjects(gradeId!, selectedSubjectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grade", gradeId] });
      toast({ title: "Subjects assigned successfully" });
      setAddSubjectOpen(false);
      setSelectedSubjectIds([]);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Error";
      toast({ title: "Failed to assign subjects", description: message, variant: "destructive" });
    },
  });

  // Remove student mutation
  const removeStudent = useMutation({
    mutationFn: (studentId: string) => gradesAPI.removeStudent(gradeId!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grade", gradeId] });
      toast({ title: "Student removed" });
    },
  });

  // Remove subject mutation
  const removeSubject = useMutation({
    mutationFn: (subjectId: string) => gradesAPI.removeSubject(gradeId!, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grade", gradeId] });
      toast({ title: "Subject removed" });
    },
  });

  // Download Excel template
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["First Name", "Last Name", "Gender", "Date of Birth", "Phone", "Email"],
      ["John", "Doe", "male", "2010-05-15", "0712345678", ""],
      ["Jane", "Smith", "female", "2011-03-22", "0723456789", ""],
    ]);
    ws["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_template.xlsx");
  };

  // Excel upload for students
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No rows found in the Excel sheet.", variant: "destructive" });
        return;
      }

      // Create students from Excel rows
      let successCount = 0;
      let failCount = 0;

      for (const row of rows) {
        const firstName = String(row["First Name"] ?? row["firstName"] ?? row["first_name"] ?? "").trim();
        const lastName = String(row["Last Name"] ?? row["lastName"] ?? row["last_name"] ?? "").trim();
        const gender = String(row["Gender"] ?? row["gender"] ?? "male").trim().toLowerCase();
        const email = String(row["Email"] ?? row["email"] ?? "").trim();
        const dateOfBirth = String(row["Date of Birth"] ?? row["dateOfBirth"] ?? row["dob"] ?? "").trim();
        const phone = String(row["Phone"] ?? row["phone"] ?? "").trim();

        if (!firstName || !lastName) {
          failCount++;
          continue;
        }

        try {
          const created = await studentsAPI.create({ firstName, lastName, gender, ...(email && { email }), ...(dateOfBirth && { dateOfBirth }), ...(phone && { phone }) } as Parameters<typeof studentsAPI.create>[0]);
          const studentId = created.data?.data?._id ?? created.data?._id;
          if (studentId) {
            await gradesAPI.assignStudents(gradeId!, [studentId]);
            successCount++;
          }
        } catch {
          failCount++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["grade", gradeId] });
      toast({
        title: `Import complete`,
        description: `${successCount} students added${failCount > 0 ? `, ${failCount} failed` : ""}.`,
      });
    } catch {
      toast({ title: "Failed to read file", variant: "destructive" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const assignedStudentIds = new Set(grade?.students?.map((s) => s._id) ?? []);
  const assignedSubjectIds = new Set(grade?.subjects?.map((s) => s._id) ?? []);

  const filteredStudents = allStudents?.filter((s) => {
    if (assignedStudentIds.has(s._id)) return false;
    const q = studentSearch.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const filteredSubjects = allSubjects?.filter((s) => {
    if (assignedSubjectIds.has(s._id)) return false;
    const q = subjectSearch.toLowerCase();
    return s.subjectName.toLowerCase().includes(q) || s.subjectCode.toLowerCase().includes(q);
  });

  const toggleStudent = (id: string) =>
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSubject = (id: string) =>
    setSelectedSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/batches/${batchId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
              {grade?.gradeName} — Section {grade?.section}
            </h1>
            <Badge variant="secondary" className="bg-green-100 text-green-800">{grade?.status}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{grade?.gradeCode}</span>
            {grade?.batch && <span>{grade.batch.batchName} ({grade.batch.batchCode})</span>}
            <span>{grade?.students?.length ?? 0} / {grade?.maxStudents} students</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students ({grade?.students?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects ({grade?.subjects?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              {grade?.availableSlots ?? (grade?.maxStudents ?? 0) - (grade?.students?.length ?? 0)} slots available
            </p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button onClick={() => { setSelectedStudentIds([]); setAddStudentOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Students
              </Button>
            </div>
          </div>

          {grade?.students && grade.students.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Student ID</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Email</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {grade.students.map((student) => (
                      <tr key={student._id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{student.studentId}</td>
                        <td className="p-3 font-medium">{student.firstName} {student.lastName}</td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell">{student.email}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className={student.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 h-8 w-8"
                            onClick={() => removeStudent.mutate(student._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No students yet</p>
              <p className="text-sm text-muted-foreground mb-4">Add students manually or import from Excel.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />Download Template
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />Import Excel
                </Button>
                <Button onClick={() => { setSelectedStudentIds([]); setAddStudentOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />Add Manually
                </Button>
              </div>
            </div>
          )}

          {/* Excel template hint */}
          <p className="text-xs text-muted-foreground">
            Excel columns: <span className="font-mono">First Name*, Last Name*, Gender*, Date of Birth, Phone, Email</span> &nbsp;(* required)
          </p>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => { setSelectedSubjectIds([]); setAddSubjectOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subjects
            </Button>
          </div>

          {grade?.subjects && grade.subjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grade.subjects.map((subject) => (
                <Card key={subject._id}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{subject.subjectName}</CardTitle>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{subject.subjectCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 h-8 w-8 -mt-1 -mr-1"
                        onClick={() => removeSubject.mutate(subject._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {subject.category && (
                    <CardContent className="px-4 pb-3">
                      <Badge variant="outline" className="text-xs">{subject.category}</Badge>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No subjects yet</p>
              <p className="text-sm text-muted-foreground mb-4">Assign subjects to this grade.</p>
              <Button onClick={() => { setSelectedSubjectIds([]); setAddSubjectOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Add Subjects
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Students Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Students to {grade?.gradeName}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedStudentIds.includes(s._id)}
                    onCheckedChange={() => toggleStudent(s._id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.studentId} · {s.email}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {studentSearch ? "No matching students" : "No unassigned students found"}
              </p>
            )}
          </div>
          <DialogFooter className="mt-4 border-t pt-3">
            <span className="text-sm text-muted-foreground mr-auto">{selectedStudentIds.length} selected</span>
            <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancel</Button>
            <Button onClick={() => assignStudents.mutate()} disabled={selectedStudentIds.length === 0 || assignStudents.isPending}>
              {assignStudents.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subjects Dialog */}
      <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Subjects to {grade?.gradeName}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredSubjects && filteredSubjects.length > 0 ? (
              filteredSubjects.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSubjectIds.includes(s._id)}
                    onCheckedChange={() => toggleSubject(s._id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.subjectName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.subjectCode}{s.category ? ` · ${s.category}` : ""}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {subjectSearch ? "No matching subjects" : "No unassigned subjects found"}
              </p>
            )}
          </div>
          <DialogFooter className="mt-4 border-t pt-3">
            <span className="text-sm text-muted-foreground mr-auto">{selectedSubjectIds.length} selected</span>
            <Button variant="outline" onClick={() => setAddSubjectOpen(false)}>Cancel</Button>
            <Button onClick={() => assignSubjects.mutate()} disabled={selectedSubjectIds.length === 0 || assignSubjects.isPending}>
              {assignSubjects.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradeDetail;
