import { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '@/contexts/LoginContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EditDesignationDialog } from '@/components/dashboard/EditDesignationDialog';
import { NewDesignationDialog } from '@/components/dashboard/NewDesignationDialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number | null;
  total_employees?: number;
}

interface Department {
  department_id: number;
  department_name: string;
}

const Designations = () => {
  const { user } = useLogin();
  const { toast } = useToast();

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [sortOption, setSortOption] = useState<'id-asc' | 'id-desc' | 'name-asc' | 'name-desc'>('id-desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const departmentFilter = params.get('department');
  const departmentId = departmentFilter ? Number(departmentFilter) : null;

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption]);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const { data: desData, error: desError } = await supabase.from('tbldesignations').select('*');
      if (desError) throw desError;

      const deptIds = desData.map(d => d.department_id).filter(Boolean) as number[];

      const { data: deptData } = await supabase
        .from('tbldepartments')
        .select('*')
        .in('department_id', deptIds);

      const { data: empData } = await supabase
        .from('tblemployees')
        .select('employee_id, designation_id');

      const enriched = desData.map(d => ({
        ...d,
        total_employees: empData?.filter(e => e.designation_id === d.designation_id).length || 0,
      }));

      setDepartments(deptData || []);
      setDesignations(enriched);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Unable to fetch designations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { count } = await supabase
        .from('tblemployees')
        .select('employee_id', { count: 'exact', head: true })
        .eq('designation_id', id);

      if (count && count > 0) {
        toast({
          title: 'Cannot delete',
          description: `This designation has ${count} active employee(s). Reassign them first.`,
          variant: 'destructive',
        });
        return;
      }

      if (!confirm('Are you sure you want to delete this designation?')) return;

      const { error } = await supabase.from('tbldesignations').delete().eq('designation_id', id);
      if (error) throw error;

      toast({ title: 'Deleted', description: 'Designation removed successfully.' });
      fetchDesignations();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Something went wrong while deleting designation.', variant: 'destructive' });
    }
  };

  const filtered = designations
    .filter(d => d.designation_title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(d => departmentId ? d.department_id === departmentId : true);

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'id-asc') return a.designation_id - b.designation_id;
    if (sortOption === 'id-desc') return b.designation_id - a.designation_id;
    if (sortOption === 'name-asc') return a.designation_title.localeCompare(b.designation_title);
    if (sortOption === 'name-desc') return b.designation_title.localeCompare(a.designation_title);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const displayedDesignations = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="px-4 py-2">
        <Card className="w-full border-0 shadow-none bg-transparent flex-1 flex flex-col">
          <CardHeader className="px-0 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
               {/* ⭐ Back button only when opened from Departments table */}
    {departmentId && (
      <Button
        variant="outline"
        className="w-fit bg-[#001F7A] text-white hover:bg-[#0029b0]"
        onClick={() => window.history.back()}
      >
        ← Back to Departments
      </Button>
    )}

              <CardTitle className="text-2xl font-bold">
                {departmentId ? `Designations: ${departments.find(d => d.department_id === departmentId)?.department_name}` : 'Designations'}
              </CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    placeholder="Search designation"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                  <Button onClick={() => setShowNewDialog(true)} className="bg-[#001F7A] text-white hover:bg-[#0029b0]">
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
                      style={{ background: 'linear-gradient(-45deg, #ffffff, #c9d0fb)' }}
                    >
                      <DropdownMenuItem onClick={() => setSortOption('name-asc')}>Name A - Z</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-desc')}>Name Z - A</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('id-asc')}>Old → New</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('id-desc')}>New → Old</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 flex-1 flex flex-col overflow-hidden">
            <div className="border rounded-lg overflow-auto">
              <Table className="min-w-full">
                <TableHeader className="w-full bg-blue-50 p-4 rounded-xl" style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
                  <TableRow>
                    <TableHead className="font-bold">Designation</TableHead>
                    <TableHead className="font-bold">Department</TableHead>
                    <TableHead className="font-bold text-center">Active Employees</TableHead>
                    <TableHead className="font-bold text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedDesignations.map(d => (
                    <TableRow key={d.designation_id} className="hover:bg-gray-100 cursor-default select-none h-10">
                      <TableCell className="py-1 text-sm">{d.designation_title}</TableCell>
                      <TableCell className="py-1 text-sm">{departments.find(dep => dep.department_id === d.department_id)?.department_name || 'Not Assigned'}</TableCell>
                      <TableCell className="text-center py-1 text-sm">
                        {d.total_employees! > 0 ? (
                          <Link to={`/employees?designation=${d.designation_id}`} className="text-gray-900 hover:text-blue-900 hover:underline">{d.total_employees}</Link>
                        ) : <span>{d.total_employees}</span>}
                      </TableCell>
                      <TableCell className="text-end py-1 cursor-pointer">
                        <div className="flex justify-end space-x-1">
                          <Button size="sm" className="bg-blue-900 text-white hover:bg-blue-700 h-7 w-7 p-0" onClick={() => setEditingDesignation(d)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" className="bg-blue-900 text-white hover:bg-blue-700 h-7 w-7 p-0" onClick={() => handleDelete(d.designation_id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sorted.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-3 text-muted-foreground text-sm">
                        {searchTerm ? 'No designations match your search.' : 'No designations found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]">
                   Records : {rowsPerPage} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white" style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
                  {[5, 10, 15, 20, 25, 50, 100].map(num => (
                    <DropdownMenuItem key={num} onClick={() => { setRowsPerPage(num); setCurrentPage(1); }}>
                      {num}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1">Previous</Button>
                <span className="px-2 py-1 rounded text-gray-700 bg-gray-200 text-sm">Page {currentPage} of {Math.ceil(sorted.length / rowsPerPage)}</span>
                <Button size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sorted.length / rowsPerPage)))} disabled={currentPage === Math.ceil(sorted.length / rowsPerPage)} className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <EditDesignationDialog
        designation={editingDesignation}
        open={!!editingDesignation}
        onOpenChange={(open) => !open && setEditingDesignation(null)}
        onSuccess={fetchDesignations}
        departments={departments}
      />
      <NewDesignationDialog
  open={showNewDialog}
  onOpenChange={setShowNewDialog}
  onSuccess={() => {
    fetchDesignations();
    setSortOption("id-desc"); // 🔥 Auto sort New → Old
  }}
  departmets={departments}
/>

    </div>
  );
};

export default Designations;
