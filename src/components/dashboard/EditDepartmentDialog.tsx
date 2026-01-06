import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Department {
  department_id: number;
  department_name: string;
  location: string | null;
}

interface EditDepartmentDialogProps {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditDepartmentDialog = ({ 
  department, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditDepartmentDialogProps) => {
  const [departmentName, setDepartmentName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (department) {
      setDepartmentName(department.department_name);
      setLocation(department.location || '');
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tbldepartments')
        .update({
          department_name: departmentName,
          location: location || null
        })
        .eq('department_id', department.department_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department updated successfully",
        duration:2000
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update issue",
        description: "Failed to update department",
        variant: "default",
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
          <DialogTitle>Edit Department</DialogTitle>
          
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-md p-6 border border-gray-200"style={{
            background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
          }}>
         <div className="space-y-2">
  <Label htmlFor="departmentName">Department Name *</Label>
  <Input
    id="departmentName"
    value={departmentName}
    maxLength={50} // ⬅️ hard limit: max 50 chars
    onChange={(e) => {
      const value = e.target.value;
      // ✅ only allow alphabets & spaces, block numbers/symbols
      if (/^[A-Za-z\s]*$/.test(value)) {
        setDepartmentName(value);
      }
    }}
    required
  />
  {departmentName.length === 50 && (
    <p className="text-xs text-red-500">Maximum 50 characters allowed</p>
  )}
</div>

        

          <DialogFooter>
  <Button
    type="button"
    variant="outline"
    onClick={() => onOpenChange(false)}
    className="bg-white text-blue-900 border border-blue-900 hover:bg-blue-50"
  >
    Cancel
  </Button>

  <Button
    type="submit"
    disabled={loading}
    className="bg-blue-900 text-white hover:bg-blue-700"
  >
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    Update Department
  </Button>
</DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};
