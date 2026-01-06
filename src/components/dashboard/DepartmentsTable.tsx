import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditDepartmentDialog } from './EditDepartmentDialog';
import { NewDepartmentDialog } from './NewDepartmentDialog';

interface Department {
  department_id: number;
  department_name: string;
  location: string | null;
}

export const DepartmentsTable = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tbldepartments')
        .select('*')
        .order('department_name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      toast({
        title: "Data loading Issue",
        description: "Failed to fetch departments",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (departmentId: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const { error } = await supabase
        .from('tbldepartments')
        .delete()
        .eq('department_id', departmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      fetchDepartments();
    } catch (error) {
      toast({
        title: "Removal Issue",
        description: "Failed to delete department",
        variant: "default"
      });
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.location && department.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading department...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.map((department) => (
              <TableRow key={department.department_id}>
                <TableCell>{department.department_id}</TableCell>
                <TableCell className="font-medium">{department.department_name}</TableCell>
                <TableCell>{department.location || 'Not specified'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDepartment(department)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department.department_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          {searchTerm ? 'No department found matching your search.' : 'No department found.'}
          {searchTerm ? 'No departments found matching your search.' : 'No departments found.'}

        </div>
      )}

      <EditDepartmentDialog
        department={editingDepartment}
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        onSuccess={fetchDepartments}
      />

      <NewDepartmentDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchDepartments}
      />
    </div>
  );
};