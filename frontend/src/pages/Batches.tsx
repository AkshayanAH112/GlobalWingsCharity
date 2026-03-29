import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { batchesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddBatchDialog } from "@/components/batches/AddBatchDialog";
import { EditBatchDialog } from "@/components/batches/EditBatchDialog";
import { DeleteBatchDialog } from "@/components/batches/DeleteBatchDialog";

interface Batch {
  _id: string;
  batchName: string;
  batchCode: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  maxStudents: number;
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  createdAt: string;
}

const Batches = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const { toast } = useToast();

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditDialogOpen(true);
  };

  const handleDelete = (batch: Batch) => {
    setSelectedBatch(batch);
    setDeleteDialogOpen(true);
  };

  const { data: batches, isLoading, error } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await batchesAPI.getAll();
      return response.data.data; // backend: { success, data: [...], pagination }
    },
  });

  const filteredBatches = batches?.filter((batch: Batch) => {
    const query = searchQuery.toLowerCase();
    return (
      batch.batchName.toLowerCase().includes(query) ||
      batch.batchCode.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load batches</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground">
            Batches
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage class batches and schedules
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBatches && filteredBatches.length > 0 ? (
          filteredBatches.map((batch: Batch) => (
            <Card key={batch._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/batches/${batch._id}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{batch.batchName}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      {batch.batchCode}
                    </p>
                  </div>
                  <Badge className={getStatusColor(batch.status)} variant="secondary">
                    {batch.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {batch.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {batch.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Max: {batch.maxStudents} students
                    </span>
                  </div>

                  {batch.teacher && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Teacher: {batch.teacher.firstName} {batch.teacher.lastName}
                      </span>
                    </div>
                  )}

                  {batch.schedule && batch.schedule.days.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Schedule:</p>
                      <div className="flex flex-wrap gap-1">
                        {batch.schedule.days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                      {batch.schedule.startTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {batch.schedule.startTime} - {batch.schedule.endTime}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleEdit(batch); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(batch); }}>
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
              {searchQuery ? "No batches found" : "No batches yet"}
            </p>
          </div>
        )}
      </div>
    </div>

    <AddBatchDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    <EditBatchDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} batch={selectedBatch} />
    <DeleteBatchDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} batch={selectedBatch} />
  </>
  );
};

export default Batches;
