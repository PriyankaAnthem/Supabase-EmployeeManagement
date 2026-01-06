import { useState, useEffect ,useRef} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded?: (employee: any) => void;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number | null;
}

export const NewEmployeeDialog = ({ open, onOpenChange, onEmployeeAdded }: NewEmployeeDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [designationId, setDesignationId] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
   const hireDateRef = useRef<HTMLInputElement | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();

  const capitalizeWords = (val: string) => val.replace(/\b\w/g, c => c.toUpperCase());
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
  if (open) fetchData();
}, [open]);

// ✅ Updated Employee Code Logic
const generateEmployeeCode = async () => {
  const prefix = "EMP";

  // Get the latest employee ID from Supabase
  const { data, error } = await supabase
    .from("tblemployees")
    .select("employee_id")
    .order("employee_id", { ascending: false })
    .limit(1)
    .single();

  let nextId = 1;
  if (data && data.employee_id) {
    nextId = data.employee_id + 1;
  }

  // If ID is 2 digits, pad with leading zero; else take last 3 digits
  const formattedId =
    nextId < 100
      ? nextId.toString().padStart(3, "0") // e.g., 9 → "009", 45 → "045"
      : nextId.toString().slice(-3); // e.g., 1234 → "234"

  return `${prefix}${formattedId}`;
};

  const fetchData = async () => {
    try {
      const [departmentsResult, designationsResult] = await Promise.all([
        supabase.from('tbldepartments').select('*').order('department_name'),
        supabase.from('tbldesignations').select('*').order('designation_title')
      ]);
      if (departmentsResult.error) throw departmentsResult.error;
      if (designationsResult.error) throw designationsResult.error;
      setDepartments(departmentsResult.data || []);
      setDesignations(designationsResult.data || []);
    } catch (error) {
      toast({ title: "Data Loading Issue", description: "Unable to fetch departments and designations", duration: 1500 });
    }
  };

  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 3) return setEmailExists('');
    try {
      const { data } = await supabase
        .from('tblemployees')
        .select('employee_id, first_name, last_name')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      setEmailExists(data ? `This email is already registered to ${data.first_name} ${data.last_name}` : '');
    } catch (error) {
      console.warn('Email check issue:', error);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setHireDate('');
    setSalary('');
    setDepartmentId('');
    setDesignationId('');
    setPhone('');
    setEmploymentType('');
    setStatus('');
    setDateOfBirth('');
    setAddress('');
    setEmailExists('');
    setProfilePicture(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (emailExists) {
    toast({ title: "Email Already Exists", description: emailExists });
    return;
  }

  // 🆕 New check: prevent adding employee if email already exists in tbladmins
  const { data: adminExists } = await supabase
    .from("tbladmins")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (adminExists) {
    toast({ title: "Conflict Detected", description: "An admin account exists with this email. Please use different email" });
    return;
  }

  if (!departmentId || !designationId) {
    toast({ title: "Missing Selection", description: "Please select both Department and Designation" });
    return;
  }

  const salaryValue = salary ? parseFloat(salary) : 0;
  if (salaryValue <= 0) {
  toast({
    title: "Invalid Salary",
    description: "Salary cannot be 0 or empty. Please enter a valid amount.",
  });
  return;
}

  if (salaryValue > 10000000) {
    toast({ title: "Salary Limit Exceeded", description: "Salary cannot exceed ₹10,000,000" });
    return;
  }

  if (phone && !/^\d{7,15}$/.test(phone)) {
    toast({ title: "Invalid Phone", description: "Phone must be 7-15 digits" });
    return;
  }

  if (address && address.length > 250) {
    toast({ title: "Address Too Long", description: "Address cannot exceed 250 characters" });
    return;
  }

  setLoading(true);

  try {
    let fileData: string | null = null;
    if (profilePicture) fileData = await toBase64(profilePicture);

    const employeeCode = await generateEmployeeCode();
    const employeeData: any = {
      employee_code: employeeCode,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      hire_date: hireDate,
      salary: salary ? parseFloat(salary) : null,
      department_id: departmentId ? parseInt(departmentId) : null,
      designation_id: designationId ? parseInt(designationId) : null,
      phone: phone || null,
      employment_type: employmentType || null,
      status: "Active",
      date_of_birth: dateOfBirth || null,
      address: address || null,
    };
    if (fileData) employeeData.file_data = fileData;

    const { data, error } = await supabase
      .from("tblemployees")
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;

    toast({ title: "Success", description: `Employee added successfully.` });
    if (onEmployeeAdded && data) onEmployeeAdded(data);

    resetForm();
    onOpenChange(false);
  } catch (error) {
    console.error(error);
    toast({ title: "Addition Issue", description: "Unable to add employee" });
  } finally {
    setLoading(false);
  }
};

  const filteredDesignations = departmentId
    ? designations.filter(d => d.department_id === parseInt(departmentId))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white text-black rounded-xl shadow-lg border border-gray-200 overflow-auto"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-auto">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="firstName" className="text-sm">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                maxLength={25}
                className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={e => { if (/^[A-Za-z\s]*$/.test(e.target.value)) setFirstName(capitalizeWords(e.target.value)); }}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                maxLength={25}
                className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={e => { if (/^[A-Za-z\s]*$/.test(e.target.value)) setLastName(capitalizeWords(e.target.value)); }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={e => { setEmail(e.target.value.toLowerCase()); checkEmailExists(e.target.value); }}
              onPaste={e => e.preventDefault()}
              required
            />
            {emailExists && <p className="text-xs text-orange-600 mt-0.5">{emailExists}</p>}
          </div>

          {/* Hire Date & Salary */}
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

          {/* Phone & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="phone" className="text-sm">Phone</Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                placeholder="Enter phone number"
                className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                minLength={10}
              />
            </div>
            <div>
              <Label htmlFor="salary" className="text-sm">Salary</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                value={salary}
                placeholder="Max ₹10,000,000"
                className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
                onChange={(e) => {
  const raw = e.target.value; // keep raw string

  // ❌ Prevent entering 0, 00, 01, 0.5, etc.
  if (raw === "0" || /^0\d/.test(raw)) {
    return;
  }

  // ✔ Allow clearing input
  if (raw === "") {
    setSalary("");
    return;
  }

  // Now convert to number safely
  const num = parseFloat(raw);

  // ✔ Allow only valid numbers
  if (!isNaN(num) && num <= 10000000) {
    setSalary(raw);
  }
}}

                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" className="text-sm">Address</Label>
            <Input
              id="address"
              type="text"
              value={address}
              placeholder="Enter address"
              className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
              onChange={e => setAddress(e.target.value)}
              maxLength={250}
            />
          </div>

          {/* Employment Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  {['Full-Time', 'Part-Time', 'Contract', 'Intern'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div>
                <Label className="text-sm">Status</Label>
                <div className="h-9 flex items-center font-semibold text-green-700 border border-green-600 bg-green-100 rounded-md px-3">
                  Active
                </div>
              </div>
            </div>

          

          {/* Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="department" className="text-sm">Department *</Label>
              <Select value={departmentId} onValueChange={val => { setDepartmentId(val); setDesignationId(''); }} required>
                <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  {departments.map(dept => (
                    <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="designation" className="text-sm">Designation *</Label>
              <Select value={designationId} onValueChange={setDesignationId} required disabled={!departmentId || filteredDesignations.length === 0}>
                <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white shadow-lg">
                  {filteredDesignations.map(des => (
                    <SelectItem key={des.designation_id} value={des.designation_id.toString()}>
                      {des.designation_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <Label htmlFor="profilePicture" className="text-sm">Profile Picture</Label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/*"
              className="h-9"
              onChange={e => setProfilePicture(e.target.files?.[0] || null)}
            />
          </div>

          {/* Buttons */}
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-9 bg-white text-blue-900 border border-blue-900 hover:bg-blue-50" onClick={() => { onOpenChange(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" disabled={loading} className="h-9 bg-blue-900 text-white hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewEmployeeDialog;
