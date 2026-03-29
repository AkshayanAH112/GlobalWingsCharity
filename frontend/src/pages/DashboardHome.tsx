import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { studentsAPI, batchesAPI, subjectsAPI, gradesAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardList, Calendar, Loader2 } from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ["dashboard-students"],
    queryFn: async () => {
      const res = await studentsAPI.getAll({ limit: 1 });
      return res.data.pagination?.total ?? res.data.data?.length ?? 0;
    },
  });

  const { data: batchesData, isLoading: loadingBatches } = useQuery({
    queryKey: ["dashboard-batches"],
    queryFn: async () => {
      const res = await batchesAPI.getAll({ limit: 1, status: "active" });
      return res.data.pagination?.total ?? res.data.data?.length ?? 0;
    },
  });

  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ["dashboard-subjects"],
    queryFn: async () => {
      const res = await subjectsAPI.getAll({ limit: 1 });
      const d = res.data;
      return d.pagination?.total ?? (Array.isArray(d) ? d.length : d.data?.length ?? 0);
    },
  });

  const { data: gradesData, isLoading: loadingGrades } = useQuery({
    queryKey: ["dashboard-grades"],
    queryFn: async () => {
      const res = await gradesAPI.getAll({ limit: 1 });
      return res.data.pagination?.total ?? res.data.data?.length ?? 0;
    },
  });

  const stat = (value: number | undefined, loading: boolean) =>
    loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <div className="text-3xl font-bold">{value ?? 0}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your students today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/dashboard/students")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50"><Users className="h-5 w-5 text-blue-600" /></div>
          </CardHeader>
          <CardContent>{stat(studentsData, loadingStudents)}</CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/dashboard/batches")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
            <div className="p-2 rounded-lg bg-green-50"><BookOpen className="h-5 w-5 text-green-600" /></div>
          </CardHeader>
          <CardContent>{stat(batchesData, loadingBatches)}</CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/dashboard/subjects")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subjects</CardTitle>
            <div className="p-2 rounded-lg bg-purple-50"><ClipboardList className="h-5 w-5 text-purple-600" /></div>
          </CardHeader>
          <CardContent>{stat(subjectsData, loadingSubjects)}</CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/dashboard/batches")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Grades</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50"><Calendar className="h-5 w-5 text-orange-600" /></div>
          </CardHeader>
          <CardContent>{stat(gradesData, loadingGrades)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => navigate("/dashboard/students")} className="p-4 text-left border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold">Add Student</h3>
              <p className="text-sm text-muted-foreground">Register a new student</p>
            </button>
            <button onClick={() => navigate("/dashboard/marks")} className="p-4 text-left border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <ClipboardList className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold">Enter Marks</h3>
              <p className="text-sm text-muted-foreground">Record exam results</p>
            </button>
            <button onClick={() => navigate("/dashboard/attendance")} className="p-4 text-left border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold">Mark Attendance</h3>
              <p className="text-sm text-muted-foreground">Take today's attendance</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
