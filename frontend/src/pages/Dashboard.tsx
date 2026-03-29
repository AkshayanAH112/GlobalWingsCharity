import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: BookOpen, label: "Batches", path: "/dashboard/batches" },
    { icon: Calendar, label: "Subjects", path: "/dashboard/subjects" },
    { icon: ClipboardList, label: "Marks", path: "/dashboard/marks" },
    { icon: Calendar, label: "Attendance", path: "/dashboard/attendance" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 to-gold/5">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Global Wings Charity" className="h-8 w-8 object-contain" />
          <span className="font-playfair text-lg font-bold text-primary">
            Global Wings Charity
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
              <img src="/logo.png" alt="Global Wings Charity" className="h-10 w-10 object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="font-playfair text-xl font-bold text-primary">
                  Global Wings Charity
                </span>
                <span className="text-xs text-muted-foreground">Create a better future</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-navy/5 to-gold/5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
