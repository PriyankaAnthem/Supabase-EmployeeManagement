import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditEmployeeDialog } from "./EditEmployeeDialog";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  salary: number | null;
  department_id: number | null;
  designation_id: number | null;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Designation {
  designation_id: number;
  designation_title: string;
}

interface EmployeesTableProps {
  newEmployee?: Employee;
}

export const EmployeesTable = ({ newEmployee }: EmployeesTableProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // ⭐ sorting + paging state
  const [sortField, setSortField] = useState<"name" | "hire_date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newEmployee) {
      setEmployees((prev) => [newEmployee, ...prev]);
    }
  }, [newEmployee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesResult, departmentsResult, designationsResult] = await Promise.all([
        supabase.from("tblemployees").select("*"),
        supabase.from("tbldepartments").select("*").order("department_name"),
        supabase.from("tbldesignations").select("*").order("designation_title"),
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (departmentsResult.error) throw departmentsResult.error;
      if (designationsResult.error) throw designationsResult.error;

      setEmployees(employeesResult.data || []);
      setDepartments(departmentsResult.data || []);
      setDesignations(designationsResult.data || []);
    } catch (error) {
      toast({
        title: "Data Loading Issue",
        description: "Failed to fetch employees data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const { error } = await supabase.from("tblemployees").delete().eq("employee_id", employeeId);
      if (error) throw error;
      toast({ title: "Success", description: "Employee deleted successfully" });
      fetchData();
    } catch (error) {
      toast({ title: "Removal Issue", description: "Failed to delete employee" });
    }
  };

  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return "Not assigned";
    const dept = departments.find((d) => d.department_id === departmentId);
    return dept?.department_name || "Unknown";
  };

  const getDesignationTitle = (designationId: number | null) => {
    if (!designationId) return "Not assigned";
    const designation = designations.find((d) => d.designation_id === designationId);
    return designation?.designation_title || "Unknown";
  };

  // ⭐ filtering
  const filtered = employees.filter(
    (emp) =>
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ⭐ sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = sortField === "name" ? `${a.first_name} ${a.last_name}`.toLowerCase() : new Date(a.hire_date).getTime();
    let valB = sortField === "name" ? `${b.first_name} ${b.last_name}`.toLowerCase() : new Date(b.hire_date).getTime();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // ⭐ pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSortField("name");
              setSortOrder(sortOrder === "asc" && sortField === "name" ? "desc" : "asc");
            }}
          >
            Sort by Name ({sortOrder === "asc" && sortField === "name" ? "A-Z" : "Z-A"})
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSortField("hire_date");
              setSortOrder(sortOrder === "asc" && sortField === "hire_date" ? "desc" : "asc");
            }}
          >
            Sort by Hire Date ({sortOrder === "asc" && sortField === "hire_date" ? "Oldest" : "Newest"})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg cursor-default">
  <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((employee) => (
              <TableRow key={employee.employee_id}>
                <TableCell>{employee.employee_id}</TableCell>
                <TableCell className="font-medium">{employee.first_name} {employee.last_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell><Badge variant="secondary">{getDepartmentName(employee.department_id)}</Badge></TableCell>
                <TableCell><Badge variant="secondary">{getDesignationTitle(employee.designation_id)}</Badge></TableCell>
                <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                <TableCell>{employee.salary ? `$${employee.salary.toLocaleString()}` : "Not set"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingEmployee(employee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.employee_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      {/* Edit dialog */}
      <EditEmployeeDialog
        employee={editingEmployee}
        departments={departments}
        designations={designations}
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};
