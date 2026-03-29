import { useQuery } from "@tanstack/react-query";
import { studentsAPI, batchesAPI, subjectsAPI, marksAPI, attendanceAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  ClipboardList,
  Loader2,
  Download
} from "lucide-react";
import { useState } from "react";

interface Student {
  _id: string;
  status: string;
  [key: string]: unknown;
}

interface Batch {
  _id: string;
  status: string;
  [key: string]: unknown;
}

interface Subject {
  _id: string;
  isActive: boolean;
  [key: string]: unknown;
}

interface Mark {
  _id: string;
  grade: string;
  percentage: string | number;
  [key: string]: unknown;
}

interface Attendance {
  _id: string;
  status: string;
  [key: string]: unknown;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("month");

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await studentsAPI.getAll();
      return response.data;
    },
  });

  const { data: batches, isLoading: loadingBatches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await batchesAPI.getAll();
      return response.data;
    },
  });

  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectsAPI.getAll();
      return response.data;
    },
  });

  const { data: marks, isLoading: loadingMarks } = useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const response = await marksAPI.getAll();
      return response.data;
    },
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance-analytics"],
    queryFn: async () => {
      const response = await attendanceAPI.getAll();
      return response.data;
    },
  });

  const isLoading = loadingStudents || loadingBatches || loadingSubjects || loadingMarks || loadingAttendance;

  // Calculate statistics
  const stats = {
    totalStudents: students?.length || 0,
    activeStudents: students?.filter((s: Student) => s.status === 'active').length || 0,
    totalBatches: batches?.length || 0,
    activeBatches: batches?.filter((b: Batch) => b.status === 'active').length || 0,
    totalSubjects: subjects?.length || 0,
    activeSubjects: subjects?.filter((s: Subject) => s.isActive).length || 0,
  };

  // Attendance stats
  const attendanceStats = {
    total: attendance?.length || 0,
    present: attendance?.filter((a: Attendance) => a.status === 'Present').length || 0,
    absent: attendance?.filter((a: Attendance) => a.status === 'Absent').length || 0,
  };

  const attendanceRate = attendanceStats.total > 0 
    ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1) 
    : 0;

  // Grade distribution
  const gradeDistribution = marks?.reduce((acc: Record<string, number>, mark: Mark) => {
    acc[mark.grade] = (acc[mark.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const averagePercentage = marks?.length > 0
    ? (marks.reduce((sum: number, mark: Mark) => sum + parseFloat(String(mark.percentage)), 0) / marks.length).toFixed(1)
    : 0;

  // Student status distribution
  const studentStatusCounts = students?.reduce((acc: Record<string, number>, student: Student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your institution's performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeStudents} active
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-3xl font-bold">{stats.activeBatches}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {stats.totalBatches} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {attendanceStats.present}/{attendanceStats.total}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{averagePercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {marks?.length || 0} exams
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((grade) => {
                const count = gradeDistribution[grade] || 0;
                const percentage = marks && marks.length > 0 ? (count / marks.length) * 100 : 0;
                return (
                  <div key={grade} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Grade {grade}</span>
                      <span className="text-muted-foreground">{count} students</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          grade.includes('A') ? 'bg-green-500' :
                          grade.includes('B') ? 'bg-blue-500' :
                          grade.includes('C') ? 'bg-yellow-500' :
                          grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Student Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Student Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(studentStatusCounts).map(([status, count]) => {
                const countNum = Number(count);
                const percentage = stats.totalStudents > 0 ? (countNum / stats.totalStudents) * 100 : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{status}</span>
                      <span className="text-muted-foreground">{countNum} students</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          status === 'active' ? 'bg-green-500' :
                          status === 'inactive' ? 'bg-gray-500' :
                          status === 'graduated' ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Subjects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Subjects</span>
                <span className="font-bold">{stats.totalSubjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active</span>
                <span className="font-bold text-green-600">{stats.activeSubjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inactive</span>
                <span className="font-bold text-gray-600">
                  {stats.totalSubjects - stats.activeSubjects}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Exams</span>
                <span className="font-bold">{marks?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pass Rate</span>
                <span className="font-bold text-green-600">
                  {marks && marks.length > 0
                    ? ((marks.filter((m: Mark) => parseFloat(String(m.percentage)) >= 40).length / marks.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Highest Score</span>
                <span className="font-bold">
                  {marks && marks.length > 0
                    ? Math.max(...marks.map((m: Mark) => parseFloat(String(m.percentage)))).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-bold">{attendanceStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Present</span>
                <span className="font-bold text-green-600">{attendanceStats.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Absent</span>
                <span className="font-bold text-red-600">{attendanceStats.absent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
