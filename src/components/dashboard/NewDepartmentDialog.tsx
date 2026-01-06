import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NewDepartmentDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: NewDepartmentDialogProps) => {
  const [departmentName, setDepartmentName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setDepartmentName('');
    setLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert department into Supabase; store null if location is empty
      const { error } = await supabase
        .from('tbldepartments')
        .insert({
          department_name: departmentName,
          location: location || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department added successfully",
        duration:3000
      });
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Adding Issue",
        description: "Failed to add department",
        variant: "default",
        duration:3000
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
          <DialogTitle>Add New Department</DialogTitle>
          
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-md p-6 border border-gray-200" style={{
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
    Add Department
  </Button>
</DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};
