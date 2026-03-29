import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { batchesAPI, gradesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, Users, Loader2 } from "lucide-react";
import { AddGradeDialog } from "@/components/grades/AddGradeDialog";

interface Grade {
  _id: string;
  gradeName: string;
  gradeCode: string;
  section: string;
  status: string;
  maxStudents: number;
  currentStudents?: number;
  subjects?: { _id: string; subjectName: string }[];
}

interface Batch {
  _id: string;
  batchName: string;
  batchCode: string;
  description?: string;
  status?: string;
}

const BatchDetail = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [addGradeOpen, setAddGradeOpen] = useState(false);

  const { data: batch, isLoading: batchLoading } = useQuery<Batch>({
    queryKey: ["batch", batchId],
    queryFn: async () => {
      const res = await batchesAPI.getById(batchId!);
      return res.data.data ?? res.data;
    },
    enabled: !!batchId,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ["grades", batchId],
    queryFn: async () => {
      const res = await gradesAPI.getAll({ batchId });
      // backend returns array wrapped in data or directly
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload.data)) return payload.data;
      return [];
    },
    enabled: !!batchId,
  });

  const statusColor = (s?: string) => {
    if (s === "active") return "bg-green-100 text-green-800";
    if (s === "completed") return "bg-gray-100 text-gray-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  if (batchLoading) {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/batches")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
              {batch?.batchName ?? "Batch"}
            </h1>
            {batch?.status && (
              <Badge className={statusColor(batch.status)} variant="secondary">
                {batch.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{batch?.batchCode}</p>
          {batch?.description && (
            <p className="text-muted-foreground mt-1 text-sm">{batch.description}</p>
          )}
        </div>
        <Button onClick={() => setAddGradeOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Grade
        </Button>
      </div>

      {/* Grades Grid */}
      {gradesLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : grades && grades.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {grades.map((grade) => (
            <Card
              key={grade._id}
              className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-primary/30"
              onClick={() => navigate(`/dashboard/batches/${batchId}/grades/${grade._id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{grade.gradeName}</CardTitle>
                  <Badge className={statusColor(grade.status)} variant="secondary">
                    {grade.status}
                  </Badge>
                </div>
                <p className="text-sm font-mono text-muted-foreground">
                  {grade.gradeCode} · Section {grade.section}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {grade.currentStudents ?? 0} / {grade.maxStudents} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {grade.subjects?.length ?? 0} subjects
                  </span>
                </div>
                <p className="text-xs text-primary font-medium">Click to manage →</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No grades yet</p>
          <p className="text-muted-foreground mb-6">Add grades like Grade 10, Grade 11 to this batch.</p>
          <Button onClick={() => setAddGradeOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Grade
          </Button>
        </div>
      )}

      <AddGradeDialog open={addGradeOpen} onOpenChange={setAddGradeOpen} batchId={batchId!} />
    </div>
  );
};

export default BatchDetail;
