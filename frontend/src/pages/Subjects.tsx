import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subjectsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { EditSubjectDialog } from "@/components/subjects/EditSubjectDialog";
import { DeleteSubjectDialog } from "@/components/subjects/DeleteSubjectDialog";

interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  description?: string;
  credits: number;
  totalClasses: number;
  category: string;
  isActive: boolean;
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const Subjects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectsAPI.getAll();
      return response.data.data; // { success, data: [...], pagination }
    },
  });

  const filteredSubjects = subjects?.filter((subject: Subject) => {
    const query = searchQuery.toLowerCase();
    return (
      subject.subjectName.toLowerCase().includes(query) ||
      subject.subjectCode.toLowerCase().includes(query) ||
      subject.category.toLowerCase().includes(query)
    );
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Core":
        return "bg-blue-100 text-blue-800";
      case "Elective":
        return "bg-purple-100 text-purple-800";
      case "Practical":
        return "bg-green-100 text-green-800";
      case "Theory":
        return "bg-orange-100 text-orange-800";
      case "Project":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load subjects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Subjects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage subjects and courses
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSubjects && filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject: Subject) => (
            <Card key={subject._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{subject.subjectName}</CardTitle>
                      {!subject.isActive && (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {subject.subjectCode}
                    </p>
                  </div>
                  <Badge className={getCategoryColor(subject.category)} variant="secondary">
                    {subject.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subject.description}
                  </p>
                )}
                
                {subject.teacher && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Teacher:</p>
                    <p className="text-sm font-medium">
                      {subject.teacher.firstName} {subject.teacher.lastName}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedSubject(subject); setEditOpen(true); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setSelectedSubject(subject); setDeleteOpen(true); }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No subjects found" : "No subjects yet"}
            </p>
          </div>
        )}
      </div>

      <AddSubjectDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditSubjectDialog open={editOpen} onOpenChange={setEditOpen} subject={selectedSubject} />
      <DeleteSubjectDialog open={deleteOpen} onOpenChange={setDeleteOpen} subject={selectedSubject} />
    </div>
  );
};

export default Subjects;
