import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ClipboardList, CalendarDays, PlusCircle, X, Search } from "lucide-react";

const TaskStatus = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch tasks with department
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tblemployeetasks")
      .select(`
        id,
        task_title,
        task_description,
        due_date,
        status,
        created_at,
        tblemployees:employee_id (
          employee_id,
          first_name,
          last_name,
          department_id,
          tbldepartments (
            department_name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load task data.");
      console.error(error);
    } else {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🧭 Navigate to assign new task
  const handleNewTask = () => {
    navigate("/employee-action/assign-task");
  };

  // 🗓️ Open modal for due date change
  const handleChangeDueDate = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDateModal(true);
  };

  // 🗓️ Save due date
  const handleSaveDate = async () => {
    if (!newDueDate || !selectedTaskId) return toast.warning("Please select a date");

    const { error } = await supabase
      .from("tblemployeetasks")
      .update({ due_date: newDueDate })
      .eq("id", selectedTaskId);

    if (error) {
      toast.error("Failed to update due date.");
    } else {
      toast.success("Due date updated successfully!");
      fetchTasks();
      setShowDateModal(false);
      setNewDueDate("");
      setSelectedTaskId(null);
    }
  };

  // 🔍 Search filter (by employee name or department)
  const filteredTasks = tasks.filter((task) => {
    const employeeName = `${task.tblemployees?.first_name || ""} ${task.tblemployees?.last_name || ""}`.toLowerCase();
    const department = task.tblemployees?.tbldepartments?.department_name?.toLowerCase() || "";
    return (
      employeeName.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-blue">
              <ClipboardList className="h-5 w-5 text-blue-900" />
              Task Status Board
            </CardTitle>

            {/* 🔍 Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <p className="text-center text-gray-500">No tasks found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg text-sm bg-white text-gray-800">
                <thead className="bg-[#001F7A] text-white">
                  <tr>
                    <th className="py-2 px-3 text-left">Employee</th>
                    <th className="py-2 px-3 text-left">Department</th>
                    <th className="py-2 px-3 text-left">Task Title</th>
                    <th className="py-2 px-3 text-left">Due Date</th>
                    <th className="py-2 px-3 text-left">Status</th>
                    <th className="py-2 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-2 px-3">
                        {task.tblemployees?.first_name ?? "Unknown"}{" "}
                        {task.tblemployees?.last_name ?? ""}
                      </td>
                      <td className="py-2 px-3">
                        {task.tblemployees?.tbldepartments?.department_name || "—"}
                      </td>
                      <td className="py-2 px-3 font-medium">{task.task_title}</td>
                      <td className="py-2 px-3">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                      <td
                        className={`py-2 px-3 font-semibold ${
                          task.status === "Completed"
                            ? "text-green-600"
                            : task.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {task.status}
                      </td>
                      <td className="py-2 px-3 flex justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-900 hover:bg-blue-900 text-white h-7 px-2"
                          onClick={() => handleChangeDueDate(task.id)}
                        >
                          <CalendarDays className="h-3.5 w-3.5 mr-1" />
                          Change Due Date
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-900 hover:bg-blue-900 text-white h-7 px-2"
                          onClick={handleNewTask}
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          New Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🗓️ Date Picker Modal */}
      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#001F7A]">Select New Due Date</h3>
              <button onClick={() => setShowDateModal(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDateModal(false)}
                className="bg-blue-900 hover:bg-blue-900 text-white"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-900 hover:bg-blue-900 text-white"
                onClick={handleSaveDate}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStatus;
