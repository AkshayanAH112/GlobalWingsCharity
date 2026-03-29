import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentsAPI } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddStudentDialog } from "@/components/students/AddStudentDialog";
import { EditStudentDialog } from "@/components/students/EditStudentDialog";
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog";

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  address?: string;
  status: string;
  enrollmentDate: string;
  batchId?: {
    _id: string;
    batchName: string;
    batchCode: string;
  };
  gradeId?: {
    _id: string;
    gradeName: string;
    gradeCode: string;
  };
}

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const { data: students, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await studentsAPI.getAll();
      return response.data.data; // backend: { success, data: [...], pagination }
    },
  });

  const filteredStudents = students?.filter((student: Student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.studentId.toLowerCase().includes(query) ||
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load students</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage student records and information
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Students ({filteredStudents?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student: Student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.batchId?.batchName || "Not Assigned"}
                        </TableCell>
                        <TableCell>
                          {student.gradeId?.gradeName || "Not Assigned"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(student.status)}
                            variant="secondary"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(student)}>
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
              <div className="md:hidden space-y-4">
                {filteredStudents.map((student: Student) => (
                  <div
                    key={student._id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-muted-foreground">
                          {student.studentId}
                        </p>
                        <h3 className="font-semibold text-lg">
                          {student.firstName} {student.lastName}
                        </h3>
                      </div>
                      <Badge
                        className={getStatusColor(student.status)}
                        variant="secondary"
                      >
                        {student.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium break-all text-right ml-2">{student.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Batch:</span>
                        <span className="font-medium">{student.batchId?.batchName || "Not Assigned"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Grade:</span>
                        <span className="font-medium">{student.gradeId?.gradeName || "Not Assigned"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Enrolled:</span>
                        <span className="font-medium">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(student)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(student)}
                      >
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
              <p className="text-muted-foreground">
                {searchQuery ? "No students found" : "No students yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddStudentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditStudentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={selectedStudent}
      />
      <DeleteStudentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        student={selectedStudent}
      />
    </div>
  );
};

export default Students;
