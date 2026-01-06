import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditDesignationDialog } from './EditDesignationDialog';
import { NewDesignationDialog } from './NewDesignationDialog';

interface Designation {
  designation_id: number;
  designation_title: string;
}

export const DesignationsTable = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tbldesignations')
        .select('*')
        .order('designation_title');

      if (error) throw error;
      setDesignations(data || []);
    } catch (error) {
      toast({

        title: "Error",
        description: "Failed to fetch designations",
        variant: "destructive"

      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (designationId: number) => {
    if (!confirm('Are you sure you want to delete this designation?')) return;

    try {
      const { error } = await supabase
        .from('tbldesignations')
        .delete()
        .eq('designation_id', designationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Designation deleted successfully",
      });
      fetchDesignations();
    } catch (error) {
      toast({

        title: "Error",
        description: "Failed to delete designation",
        variant: "destructive"

      });
    }
  };

  const filteredDesignations = designations.filter(designation =>
    designation.designation_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading designations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input

            placeholder="Search designations"

            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Designation
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Designation Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDesignations.map((designation) => (
              <TableRow key={designation.designation_id}>
                <TableCell>{designation.designation_id}</TableCell>
                <TableCell className="font-medium">{designation.designation_title}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDesignation(designation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(designation.designation_id)}
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

      {filteredDesignations.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          {searchTerm ? 'No designations found matching your search.' : 'No designations found.'}
        </div>
      )}

      <EditDesignationDialog
        designation={editingDesignation}
        open={!!editingDesignation}
        onOpenChange={(open) => !open && setEditingDesignation(null)}
        onSuccess={fetchDesignations}
      />

      <NewDesignationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchDesignations}
      />
    </div>
  );
};