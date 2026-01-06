// src/pages/Departments.tsx
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useLogin } from "@/contexts/LoginContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditDepartmentDialog } from "@/components/dashboard/EditDepartmentDialog";
import { NewDepartmentDialog } from "@/components/dashboard/NewDepartmentDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Department {
  department_id: number;
  department_name: string;
  location: string | null;
  total_designations?: number;
  total_employees?: number;
}

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number;
}

const Departments = () => {
  const { user } = useLogin();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [departmentDesignations, setDepartmentDesignations] = useState<Designation[]>([]);
  const [sortOption, setSortOption] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!user) return <Navigate to="/login" replace />;

  // Fetch departments once
  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data: deptData, error: deptError } = await supabase.from("tbldepartments").select("*");
      if (deptError) throw deptError;

      if (!deptData) {
        setDepartments([]);
        return;
      }

      const deptIds = deptData.map((d: any) => d.department_id);

      const { data: empData, error: empError } = await supabase
        .from("tblemployees")
        .select("employee_id, department_id")
        .in("department_id", deptIds);
      if (empError) throw empError;

      const { data: desData, error: desError } = await supabase
        .from("tbldesignations")
        .select("designation_id, department_id")
        .in("department_id", deptIds);
      if (desError) throw desError;

      const enriched = deptData.map((dept: any) => ({
        department_id: dept.department_id,
        department_name: dept.department_name,
        location: dept.location,
        total_employees: empData?.filter((e: any) => e.department_id === dept.department_id).length || 0,
        total_designations: desData?.filter((d: any) => d.department_id === dept.department_id).length || 0,
      }));

      setDepartments(enriched);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Unable to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { count, error: countError } = await supabase
        .from("tblemployees")
        .select("employee_id", { count: "exact", head: true })
        .eq("department_id", id);

      if (countError) throw countError;

      if (count && count > 0) {
        toast({
          title: "Cannot delete",
          description: `This department has ${count} active employee(s). Reassign them first.`,
          variant: "destructive",
        });
        return;
      }

      if (!confirm("Are you sure you want to delete this department?")) return;

      const { error } = await supabase.from("tbldepartments").delete().eq("department_id", id);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Department removed successfully",
      });

      // Refresh
      fetchDepartments();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong while deleting department.",
        variant: "destructive",
      });
    }
  };

  const fetchDepartmentDesignations = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("tbldesignations")
        .select("*")
        .eq("department_id", id)
        .order("designation_title");
      if (error) throw error;
      setDepartmentDesignations(data || []);
    } catch {
      toast({ title: "Error", description: "Unable to fetch designations" });
      setDepartmentDesignations([]);
    }
  };

  const filtered = departments.filter((d) =>
    d.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "id-asc") return a.department_id - b.department_id;
    if (sortOption === "id-desc") return b.department_id - a.department_id;
    if (sortOption === "name-asc") return a.department_name.localeCompare(b.department_name);
    if (sortOption === "name-desc") return b.department_name.localeCompare(a.department_name);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const displayedDepartments = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="px-4 py-2">
        <Card className="w-full border-0 shadow-none bg-transparent flex-1 flex flex-col">
          <CardHeader className="px-0 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <CardTitle className="text-2xl font-bold">Departments</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    placeholder="Search department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-black bg-white border border-gray-300 shadow-sm"
                  />
                  {searchTerm && (
  <button
    onClick={() => setSearchTerm("")}
    className="
      absolute right-3 top-1/2 -translate-y-1/2
      text-gray-500 hover:text-black
      text-xs p-1
      bg-transparent hover:bg-transparent active:bg-transparent
      focus:outline-none
    "
  >
    ×
  </button>
)}

                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowNewDialog(true)}
                    className="bg-[#001F7A] text-white hover:bg-[#0029b0]"
                    title="Add department"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]" title="Sort">
  Sort: {sortOption === "id-desc"
    ? "New → Old"
    : sortOption === "id-asc"
    ? "Old → New"
    : sortOption === "name-asc"
    ? "A → Z"
    : "Z → A"
  }
  <ChevronDown className="ml-2 h-4 w-4" />
</Button>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white"
                      style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
                    >
                      <DropdownMenuItem onClick={() => setSortOption("name-asc")}>Name A - Z</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("name-desc")}>Name Z - A</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("id-asc")}>Old → New</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("id-desc")}>New → Old</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 flex-1 flex flex-col overflow-hidden">
           <div className="border rounded-lg overflow-auto">
              <Table className="min-w-full">
                <TableHeader
                  className="w-full bg-blue-50 p-4 rounded-xl"
                  style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
                >
                  <TableRow>
                    <TableHead className="font-bold">Department</TableHead>
                    <TableHead className="font-bold text-center">Total Designations</TableHead>
                    <TableHead className="font-bold text-center">Active Employees</TableHead>
                    <TableHead className=" font-bold text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedDepartments.map((d) => (
                    <TableRow key={d.department_id} className="hover:bg-gray-100 cursor-default select-none h-10">
                      <TableCell className="py-1 text-sm">{d.department_name}</TableCell>
                      <TableCell className="text-center py-1 text-sm cursor-default">
                        {d.total_designations! > 0 ? (
                          <Link
                            to={`/designations?department=${d.department_id}`}
                            className="text-gray-900 hover:text-blue-900 hover:underline"
                          >
                            {d.total_designations}
                          </Link>
                        ) : (
                          <span>{d.total_designations}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1 text-sm cursor-default">
                        {d.total_employees! > 0 ? (
                          <Link
                            to={`/employees?department=${d.department_id}`}
                            className="text-gray-900 hover:text-blue-900 hover:underline"
                          >
                            {d.total_employees}
                          </Link>
                        ) : (
                          <span>{d.total_employees}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end py-0 cursor-pointer">
                        <div className="flex justify-end space-x-1">
                          <Button
                            size="sm"
                            className="bg-blue-900 text-white hover:bg-blue-700 h-7 w-7 p-0"
                            title="View"
                            onClick={async () => {
                              await fetchDepartmentDesignations(d.department_id);
                              setViewingDepartment(d);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                           <Button
                              size="sm"
                              className="bg-blue-900 text-white hover:bg-blue-700 h-7 w-7 p-0"
                              title="Edit"
                              onClick={() => setEditingDepartment(d)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                            size="sm"
                            className="bg-blue-900 text-white hover:bg-blue-700 h-7 w-7 p-0"
                            title="Delete"
                            onClick={() => handleDelete(d.department_id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sorted.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-3 text-muted-foreground text-sm">
                        {searchTerm ? "No departments match your search." : "No departments found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
              <div className="flex items-center gap-2">
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]">Records :{rowsPerPage}
                              <ChevronDown className="ml-2 h-4 w-4" /> 
                            </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white"
                    style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
                  >
                    {[5, 10, 15, 20, 25, 50, 100].map((num) => (
                      <DropdownMenuItem
                        key={num}
                        onClick={() => {
                          setRowsPerPage(num);
                          setCurrentPage(1);
                        }}
                      >
                        {num}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
                  className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1"
                >
                  Previous
                </Button>
                <span className="px-2 py-1 rounded text-gray-700 bg-gray-200 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1"
                  title="Next Page"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit / New Dialogs */}
      <EditDepartmentDialog
        department={editingDepartment}
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        onSuccess={fetchDepartments}
      />
      <NewDepartmentDialog
  open={showNewDialog}
  onOpenChange={setShowNewDialog}
  onSuccess={() => {
    fetchDepartments();
    setSortOption("id-desc"); // 🔥 Auto sort New → Old after adding
  }}
/>


      {/* Details Dialog */}
      <Dialog open={!!viewingDepartment} onOpenChange={(open) => !open && setViewingDepartment(null)}>
        <DialogContent className="max-w-lg bg-blue-50 p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-900">Department Details</DialogTitle>
          </DialogHeader>
          {viewingDepartment && (
            <div className="space-y-3 relative">
              <p>
                <span className="font-semibold">Department Name:</span> {viewingDepartment.department_name}
              </p>
              <p>
                <span className="font-semibold">Total Designations:</span> {departmentDesignations.length}
              </p>
              {departmentDesignations.length > 0 ? (
                <ul className="list-disc list-inside ml-4">
                  {departmentDesignations.map((des) => (
                    <li key={des.designation_id}>{des.designation_title}</li>
                  ))}
                </ul>
              ) : (
                <p>No designations found.</p>
              )}
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  className="bg-blue-700 text-white hover:bg-blue-600"
                  title="Edit Department"
                  onClick={() => {
                    setEditingDepartment(viewingDepartment);
                    setViewingDepartment(null);
                  }}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;
