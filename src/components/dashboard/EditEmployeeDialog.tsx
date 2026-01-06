import { useState, useEffect ,useRef} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  salary: number | null;
  department_id: number | null;
  designation_id: number | null;
  file_data?: string | null;
  phone?: string;
  employment_type?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  status?: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  date_of_birth?: string;
  address?: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number;
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  departments: Department[];
  designations: Designation[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditEmployeeDialog = ({
  employee,
  departments,
  designations,
  open,
  onOpenChange,
  onSuccess
}: EditEmployeeDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [designationId, setDesignationId] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // New fields
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const hireDateRef = useRef<HTMLInputElement | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);



  const { toast } = useToast();

 useEffect(() => {
  if (employee) {
    // Load department first
    const deptId = employee.department_id?.toString() || '';
    setDepartmentId(deptId);

    // Set other fields normally
    setFirstName(employee.first_name);
    setLastName(employee.last_name);
    setEmail(employee.email);
    setHireDate(employee.hire_date);
    setSalary(employee.salary?.toString() || '');
    setPhone(employee.phone || '');
    setEmploymentType(employee.employment_type || '');
    setStatus(employee.status || '');
    setDateOfBirth(employee.date_of_birth || '');
    setAddress(employee.address || '');

    // Delay designation setting until filteredDesignations is ready
    setTimeout(() => {
      setDesignationId(employee.designation_id?.toString() || '');
    }, 0);
  }
}, [employee]);

  useEffect(() => {
    if (!open) setProfilePicture(null);
  }, [open]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const filteredDesignations = designations.filter(
    (d) => d.department_id === Number(departmentId)
  );

  const capitalizeWords = (str: string) => str.replace(/\b\w/g, char => char.toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!departmentId || !designationId) {
      toast({ title: "Missing Selection", description: "Please select both Department and Designation", duration: 2000 });
      return;
    }

    const salaryValue = salary ? parseFloat(salary) : 0;
    if (salaryValue > 10000000) {
      toast({ title: "Salary Limit Exceeded", description: "Salary cannot exceed ₹10,000,000", duration: 2000 });
      return;
    }

    setLoading(true);

    try {
      const employeeData: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        hire_date: hireDate,
        salary: salary ? parseFloat(salary) : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        designation_id: designationId ? parseInt(designationId) : null,
        phone,
        employment_type: employmentType,
        status,
        date_of_birth: dateOfBirth,
        address
      };

      if (profilePicture) {
        const base64String = await fileToBase64(profilePicture);
        employeeData.file_data = base64String;
      }

      const { error } = await supabase
        .from('tblemployees')
        .update(employeeData)
        .eq('employee_id', employee.employee_id);

      if (error) throw error;

      toast({ title: "Success", description: "Employee updated successfully", duration: 2000 });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Update Issue", description: "Failed to update employee", duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white text-black rounded-xl shadow-lg border border-gray-200 overflow-auto"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                maxLength={25}
                className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z\s]*$/.test(value)) setFirstName(capitalizeWords(value));
                }}
                onPaste={(e) => e.preventDefault()}
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                maxLength={25}
                className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={(e) => /^[A-Za-z\s]*$/.test(e.target.value) && setLastName(capitalizeWords(e.target.value))}
                onPaste={(e) => e.preventDefault()}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
              className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              onPaste={(e) => e.preventDefault()}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
  <Label htmlFor="hireDate">Hire Date</Label>

  <div
    onClick={() => {
      hireDateRef.current?.showPicker?.(); // Chrome/Edge
      hireDateRef.current?.focus();        // Firefox
    }}
    className="cursor-pointer"
  >
    <Input
      id="hireDate"
      ref={hireDateRef}
      type="date"
      value={hireDate}
      className="border border-blue-500 focus:ring-2 focus:ring-blue-600 
                 focus:border-blue-600 bg-blue-50 text-blue-900 
                 placeholder-blue-400 rounded-md cursor-pointer"
      onChange={(e) => setHireDate(e.target.value)}
      max={new Date().toISOString().split('T')[0]}
      min="2000-01-01"
      required
    />
  </div>

  {/* Enlarged Calendar Icon */}
 
</div>

            

            <div className="relative">
  <Label htmlFor="dateOfBirth">Date of Birth</Label>

  <div
    onClick={() => {
      dobRef.current?.showPicker?.(); // Chrome/Edge
      dobRef.current?.focus();        // Firefox fallback
    }}
    className="cursor-pointer"
  >
    <Input
      id="dateOfBirth"
      ref={dobRef}
      type="date"
      value={dateOfBirth}
      className="border border-blue-500 focus:ring-2 focus:ring-blue-600 
                 focus:border-blue-600 bg-blue-50 text-blue-900 
                 placeholder-blue-400 rounded-md cursor-pointer"
      onChange={(e) => setDateOfBirth(e.target.value)}
      max="2007-12-31"
    />
  </div>

  {/* Calendar Icon */}
 
</div>

          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="text"
              value={phone}
              maxLength={10}
              
              className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={address}
              className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              value={salary}
              placeholder="Enter salary (max 10,000,000)"
              className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value <= 10000000) setSalary(e.target.value);
                else if (e.target.value === '') setSalary('');
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={departmentId}
                onValueChange={(val) => {
                  setDepartmentId(val);
                  if (!filteredDesignations.find(d => d.designation_id === parseInt(designationId || '0'))) {
                    setDesignationId('');
                  }
                }}
              >
                <SelectTrigger className="w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select department" />
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

            <div>
              <Label htmlFor="designation">Designation</Label>
              <Select
                value={designationId || ''}
                onValueChange={setDesignationId}
                disabled={!departmentId || filteredDesignations.length === 0}
              >
                <SelectTrigger className="w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  {filteredDesignations.map((des) => (
                    <SelectItem key={des.designation_id} value={des.designation_id.toString()}>
                      {des.designation_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg" >
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="profilePicture" className="text-sm">Profile Picture</Label>
            <div className="flex items-center gap-2">
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                className="h-9"
                onChange={e => setProfilePicture(e.target.files?.[0] || null)}
              />
              {profilePicture && (
                <button
                  type="button"
                  onClick={() => {
                    setProfilePicture(null);
                    document.getElementById("profilePicture")!.value = "";
                  }}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Deselect
                </button>
              )}
            </div>
            {profilePicture && <p className="text-xs text-gray-500 mt-1">Selected: {profilePicture.name}</p>}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="bg-white text-blue-900 border border-blue-900 hover:bg-blue-50" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
