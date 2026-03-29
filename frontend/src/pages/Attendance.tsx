import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceAPI } from "@/lib/api";
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
import { Plus, Search, Calendar as CalendarIcon, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Attendance {
  _id: string;
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  batch: {
    _id: string;
    batchName: string;
  };
  subject?: {
    _id: string;
    subjectName: string;
  };
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const { data: attendance, isLoading, error } = useQuery({
    queryKey: ["attendance", dateFilter],
    queryFn: async () => {
      const response = await attendanceAPI.getAll({ date: dateFilter });
      return response.data.data;
    },
  });

  const filteredAttendance = attendance?.filter((record: Attendance) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      record.student.firstName.toLowerCase().includes(query) ||
      record.student.lastName.toLowerCase().includes(query) ||
      record.student.studentId.toLowerCase().includes(query) ||
      record.batch.batchName.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      case "Excused":
        return "bg-blue-100 text-blue-800";
      case "Holiday":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Late":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Calculate stats
  const stats = {
    total: filteredAttendance?.length || 0,
    present: filteredAttendance?.filter((r: Attendance) => r.status === "Present").length || 0,
    absent: filteredAttendance?.filter((r: Attendance) => r.status === "Absent").length || 0,
    late: filteredAttendance?.filter((r: Attendance) => r.status === "Late").length || 0,
  };

  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load attendance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Attendance
          </h1>
          <p className="text-muted-foreground mt-2">
            Track daily student attendance
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600">{attendanceRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Excused">Excused</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records ({filteredAttendance?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAttendance && filteredAttendance.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record: Attendance) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {record.student.firstName} {record.student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.student.studentId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{record.batch.batchName}</TableCell>
                        <TableCell>
                          {record.subject?.subjectName || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)} variant="secondary">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(record.status)}
                              {record.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.checkInTime
                            ? new Date(record.checkInTime).toLocaleTimeString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.checkOutTime
                            ? new Date(record.checkOutTime).toLocaleTimeString()
                            : "-"}
                        </TableCell>
                        <TableCell>{record.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredAttendance.map((record: Attendance) => (
                  <div
                    key={record._id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {record.student.firstName} {record.student.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {record.student.studentId}
                        </p>
                      </div>
                      <Badge className={getStatusColor(record.status)} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Batch:</span>
                        <span className="font-medium">{record.batch.batchName}</span>
                      </div>
                      {record.subject && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="font-medium">{record.subject.subjectName}</span>
                        </div>
                      )}
                      {record.checkInTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Check In:</span>
                          <span>{new Date(record.checkInTime).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {record.checkOutTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Check Out:</span>
                          <span>{new Date(record.checkOutTime).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {record.remarks && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                          <p className="text-sm">{record.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" ? "No attendance records found" : "No attendance marked for this date"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
