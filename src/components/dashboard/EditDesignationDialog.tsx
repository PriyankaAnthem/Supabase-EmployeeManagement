import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Department {
  department_id: number;
  department_name: string;
}

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number | null;
}

interface EditDesignationDialogProps {
  designation: Designation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditDesignationDialog = ({
  designation,
  open,
  onOpenChange,
  onSuccess
}: EditDesignationDialogProps) => {
  const [designationTitle, setDesignationTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (designation) {
      setDesignationTitle(designation.designation_title);
      setDepartmentId(designation.department_id);
    }
  }, [designation]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('tbldepartments')
        .select('*')
        .order('department_name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to fetch departments',
        variant: 'default',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation) return;

    if (!departmentId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a department',
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tbldesignations')
        .update({
          designation_title: designationTitle,
          department_id: departmentId
        })
        .eq('designation_id', designation.designation_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Designation updated successfully',
        duration:2000
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Update Issue',
        description: 'Failed to update designation',
        variant: 'default',
        duration:2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white text-black rounded-xl shadow-lg border border-gray-200"style={{
            background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
          }}>
        <DialogHeader>
          <DialogTitle>Edit Designation</DialogTitle>
          
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-md p-6 border border-gray-200" style={{
            background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
          }}>
          

          {/* Department Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentSelect">Department Title *</Label>
              <Select
                value={departmentId !== null ? String(departmentId) : ''}
                onValueChange={(val) => setDepartmentId(Number(val))}
                required
              >
                <SelectTrigger className="w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select " />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  {departments.map((dept) => (
                    <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
            <Label htmlFor="designationTitle">Designation Title *</Label>
            <Input
              id="designationTitle"
              value={designationTitle}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[A-Za-z\s]*$/.test(value)) {
                  setDesignationTitle(value);
                }
              }}
              required
            />
            {designationTitle.length === 50 && (
              <p className="text-xs text-red-500">Maximum 50 characters allowed</p>
            )}
          </div>
          </div>

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white text-blue-900 border border-blue-900 hover:bg-blue-50"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} className="bg-blue-900 text-white hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Designation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDesignationDialog;
