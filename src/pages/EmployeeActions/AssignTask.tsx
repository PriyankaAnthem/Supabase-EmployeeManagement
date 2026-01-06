import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";
import { useLogin } from "@/contexts/LoginContext";
import Navbar from "@/components/ui/Navbar";


const AssignTask = () => {
  const { user } = useLogin(); // Logged-in admin/manager info
  const [employees, setEmployees] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("tblemployees")
        .select("employee_id, first_name, last_name");

      if (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees.");
      } else {
        setEmployees(data);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Handle form submission
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle || !assignedTo || !dueDate) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const employeeId = parseInt(assignedTo);

    const { error } = await supabase.from("tblemployeetasks").insert([
      {
        employee_id: employeeId,
        task_title: taskTitle,
        task_description: taskDescription,
        due_date: dueDate,
        status: "Pending",
        assigned_by: user?.employee_id || null,
        created_at: new Date(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error assigning task:", error);
      toast.error("Failed to assign task.");
    } else {
      toast.success("Task assigned successfully!");
      setTaskTitle("");
      setTaskDescription("");
      setAssignedTo("");
      setDueDate("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ✅ Navbar */}
    

      {/* ✅ Main Content */}
      <main className="flex-grow p-6 mt-20">
        <Card className="max-w-2xl mx-auto shadow-lg"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#001F7A]">
              Assign Employee Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignTask} className="space-y-5">
              {/* Task Title */}
              <div>
                <Label>Task Title</Label>
                <Input
                  type="text"
                  placeholder="Enter task title"
                   className="border border-black focus:ring-0 focus:border-black"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              {/* Task Description */}
              <div>
                <Label>Task Description</Label>
                <Textarea
                  placeholder="Describe the task details..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                   className="border border-black focus:ring-0 focus:border-black"
                />
              </div>

              {/* Assign To Employee */}
              <div>
                <Label>Assign To</Label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="border border-gray-300 rounded-md w-full p-2 bg-blue-900 text-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="bg-[#001F7A] hover:bg-[#002db3] text-white w-full"
                disabled={loading}
              >
                {loading ? "Assigning Task..." : "Assign Task"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      
    </div>
  );
};

export default AssignTask;
