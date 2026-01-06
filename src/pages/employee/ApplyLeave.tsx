import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";

const ApplyLeave: React.FC = () => {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    no_of_leaves: "",
  });
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);

  // ✅ Fetch logged-in employee from localStorage
  useEffect(() => {
    const storedEmployee = JSON.parse(localStorage.getItem("employee") || "{}");
    if (!storedEmployee?.employee_id) {
      toast.error("No employee data found. Please log in again.");
      return;
    }
    setEmployee(storedEmployee);
    fetchLeaveRequests(storedEmployee.employee_id);
  }, []);

  // ✅ Auto-calculate number of leaves
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData((prev) => ({ ...prev, no_of_leaves: diffDays.toString() }));
      } else {
        setFormData((prev) => ({ ...prev, no_of_leaves: "" }));
      }
    }
  }, [formData.start_date, formData.end_date]);

  // ✅ Fetch leave requests
  const fetchLeaveRequests = async (employee_id: number) => {
    try {
      const { data, error } = await supabase
        .from("tblleaverequests")
        .select("*")
        .eq("employee_id", employee_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (err: any) {
      console.error("Error fetching leave requests:", err);
      toast.error("Failed to fetch leave requests.");
    }
  };

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Submit leave request
  const handleSubmit = async () => {
    if (
      !formData.leave_type ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.no_of_leaves
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("tblleaverequests").insert([
        {
          employee_id: employee.employee_id,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          no_of_leaves: parseInt(formData.no_of_leaves, 10),
        },
      ]);

      if (error) throw error;

      toast.success("Leave request submitted successfully!");
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        no_of_leaves: "",
      });
      fetchLeaveRequests(employee.employee_id);
    } catch (err: any) {
      console.error("Error submitting leave request:", err);
      toast.error("Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete leave request (only if Pending)
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pending request?")) return;

    try {
      const { error } = await supabase
        .from("tblleaverequests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Leave request deleted successfully!");
      fetchLeaveRequests(employee.employee_id);
    } catch (err: any) {
      console.error("Error deleting leave request:", err);
      toast.error("Failed to delete leave request.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card
        className="max-w-3xl mx-auto border shadow-md"
        
      >
        <CardHeader style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
          <CardTitle className="text-[#001F7A] text-2xl font-bold">
            Apply for Leave
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 📝 Leave Application Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Leave Type</Label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                className="w-full border rounded-lg p- bg-blue-50 font-semibold text-[#001F7A}"
                
              >
                <option value="">Select Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Paid Leave">Paid Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Start Date</Label>
      <Input
        type="date"
        name="start_date"
        value={formData.start_date}
        onChange={handleChange}
      />
    </div>

    <div>
      <Label>End Date</Label>
      <Input
        type="date"
        name="end_date"
        value={formData.end_date}
        onChange={handleChange}
      />
    </div>
  </div>

  {/* No. of Leaves (NOW A LABEL ONLY) */}
  <div>
    <Label>No. of Leaves</Label>
    <p className="border p-2 rounded-lg bg-white-100 font-semibold text-[#001F7A]">
      {formData.no_of_leaves || "—"}
    </p>
  </div>

  {/* Reason */}
  <div>
    <Label>Reason</Label>
    <textarea
      name="reason"
      value={formData.reason}
      onChange={handleChange}
      className="w-full border rounded-lg p-2"
      rows={3}
      placeholder="Explain the reason for your leave..."
     
    />
  </div>
</div>
          

          <div className="flex justify-end">
            <Button
              className="bg-[#001F7A] hover:bg-blue-900 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Leave History */}
      <Card className="max-w-4xl mx-auto mt-10 border shadow-md">
        <CardHeader style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
          <CardTitle className="text-lg font-semibold text-[#001F7A]">
            Leave Request History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-gray-600">No leave requests found.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead
                className="bg-blue-50 text-[#001F7A]"
                
              >
                <tr>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                  <th className="border p-2">No. of Leaves</th>
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Applied On</th>
                  <th className="border p-2">Rejected Reason</th>

                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td className="border p-2">{leave.leave_type}</td>
                    <td className="border p-2">{leave.start_date}</td>
                    <td className="border p-2">{leave.end_date}</td>
                    <td className="border p-2 text-center">{leave.no_of_leaves}</td>
                    <td className="border p-2">{leave.reason}</td>
                    <td
                      className={`border p-2 font-semibold ${
                        leave.status === "Approved"
                          ? "text-green-600"
                          : leave.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {leave.status}
                    </td>
                    <td className="border p-2">
                      {new Date(leave.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="border p-2">{leave.rejection_reason || "—"}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;
