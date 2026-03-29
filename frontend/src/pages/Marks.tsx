import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { marksAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mark {
  _id: string;
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  subject: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  batch: {
    _id: string;
    batchName: string;
  };
  examType: string;
  examName: string;
  examDate: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

const Marks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: marks, isLoading, error } = useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const response = await marksAPI.getAll();
      return response.data;
    },
  });

  const filteredMarks = marks?.filter((mark: Mark) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      mark.student.firstName.toLowerCase().includes(query) ||
      mark.student.lastName.toLowerCase().includes(query) ||
      mark.student.studentId.toLowerCase().includes(query) ||
      mark.subject.subjectName.toLowerCase().includes(query) ||
      mark.examName.toLowerCase().includes(query);
    
    const matchesType = examTypeFilter === "all" || mark.examType === examTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800";
      case "B+":
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C+":
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load marks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Marks & Grades
          </h1>
          <p className="text-muted-foreground mt-2">
            Record and manage student exam results
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Marks
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, subject, or exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Marks Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>
            Exam Results ({filteredMarks?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMarks && filteredMarks.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMarks.map((mark: Mark) => (
                      <TableRow key={mark._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {mark.student.firstName} {mark.student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mark.student.studentId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{mark.subject.subjectName}</p>
                            <p className="text-xs text-muted-foreground">
                              {mark.subject.subjectCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{mark.examName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{mark.examType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {mark.obtainedMarks}/{mark.totalMarks}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mark.percentage}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(mark.grade)} variant="secondary">
                            {mark.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(mark.examDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredMarks.map((mark: Mark) => (
                  <div
                    key={mark._id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {mark.student.firstName} {mark.student.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {mark.student.studentId}
                        </p>
                      </div>
                      <Badge className={getGradeColor(mark.grade)} variant="secondary">
                        {mark.grade}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium">{mark.subject.subjectName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Exam:</span>
                        <span className="font-medium">{mark.examName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{mark.examType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Marks:</span>
                        <span className="font-semibold">
                          {mark.obtainedMarks}/{mark.totalMarks} ({mark.percentage}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(mark.examDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || examTypeFilter !== "all" ? "No marks found" : "No marks recorded yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Marks;
