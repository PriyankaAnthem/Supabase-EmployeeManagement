import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {Search} from "lucide-react"
interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  tblemployees: {
    first_name: string;
    last_name: string;
    tbldepartments: { department_name: string };
  };
}

const ApproveLeave: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  // ===========================
  // Fetch All Leave Requests
  // ===========================
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tblleaverequests")
        .select(`
          id,
          employee_id,
          leave_type,
          start_date,
          end_date,
          reason,
          status,
          created_at,
          rejection_reason,
          tblemployees (
            first_name,
            last_name,
            department_id,
            tbldepartments ( department_name )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (err) {
      toast.error("Failed to load leave requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // ===========================
  // Filter Requests
  // ===========================
  const filteredRequests = leaveRequests.filter((leave) => {
    const employeeName = `${leave.tblemployees?.first_name || ""} ${
      leave.tblemployees?.last_name || ""
    }`.toLowerCase();

    const department =
      leave.tblemployees?.tbldepartments?.department_name?.toLowerCase() || "";

    return (
      employeeName.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase())
    );
  });

  // ===========================
  // Check if Any Pending Exists
  // ===========================
  const hasPending = Array.isArray(filteredRequests)
    ? filteredRequests.some((req) => req.status === "Pending")
    : false;

  // ===========================
  // Update Status (Approve / Reject)
  // ===========================
  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    reason?: string
  ) => {
    try {
      setLoading(true);

      setLeaveRequests((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: newStatus, rejection_reason: reason || null }
            : l
        )
      );

      const admin = JSON.parse(localStorage.getItem("admin") || "{}");

      const { error } = await supabase
        .from("tblleaverequests")
        .update({
          status: newStatus,
          approved_by: admin?.id || null,
          rejection_reason: newStatus === "Rejected" ? reason : null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Leave request ${newStatus.toLowerCase()} successfully.`);
      fetchLeaveRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update leave status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {hasPending && (
  <div className="mt-6 bg-white border shadow-md p-4 rounded-lg max-w-3xl mx-auto">
    <h2 className="text-xl font-semibold mb-3 text-[#001F7A]">
      Approve or Reject Pending Requests
    </h2>

    {filteredRequests
      .filter((req) => req.status === "Pending")
      .map((req) => (
        <div
          key={req.id}
          className="flex justify-between items-center border-b py-3"
        >
          <div>
            <p className="font-medium">
              {req.tblemployees.first_name} {req.tblemployees.last_name}
            </p>
            <p className="text-gray-600 text-sm">{req.leave_type}</p>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-blue-900 text-white px-4 py-2 text-sm rounded-md"
              onClick={() => handleUpdateStatus(req.id, "Approved")}
              disabled={loading}
            >
              Approve
            </Button>

            <Button
              className="bg-red-600 text-white px-4 py-2 text-sm rounded-md"
              onClick={() => {
                setSelectedLeaveId(req.id);
                setShowRejectModal(true);
              }}
              disabled={loading}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
  </div>
)}

      <Card className="max-w-6xl mx-auto border shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[#001F7A] text-2xl font-bold">
            Leave Requests Management
          </CardTitle>

          <div className="relative w-full sm:w-80">
  <input
    type="text"
    placeholder="Search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-8 pr-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
  />
 <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
  {/* X BUTTON — only visible when typing */}
  {searchTerm && (
    <button
      type="button"
      onClick={() => setSearchTerm("")}
      className="
      absolute right-3 top-1/2 -translate-y-1/2
      text-gray-500 hover:text-black
      text-xs p-1
      bg-transparent hover:bg-transparent active:bg-transparent
      focus:outline-none
    "
    >
      ✖
    </button>
  )}
</div>

        </CardHeader>

        <CardContent className="px-0 flex-1 flex flex-col overflow-hidden">
  <div className="border rounded-lg overflow-auto">
    <Table className="min-w-full">
      <TableHeader
        className="w-full bg-blue-50 p-4 rounded-xl"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <TableRow>
          <TableHead className="font-bold">Employee</TableHead>
          <TableHead className="font-bold">Department</TableHead>
          <TableHead className="font-bold">Leave Type</TableHead>
          <TableHead className="font-bold">Start Date</TableHead>
          <TableHead className="font-bold">End Date</TableHead>
          <TableHead className="font-bold">Reason</TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold">Applied On</TableHead>
          <TableHead className="font-bold">Rejection Reason</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={10}
              className="text-center py-3 text-muted-foreground"
            >
              Loading...
            </TableCell>
          </TableRow>
        ) : filteredRequests.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={10}
              className="text-center py-3 text-muted-foreground"
            >
              No leave requests found.
            </TableCell>
          </TableRow>
        ) : (
          filteredRequests.map((leave) => (
            <TableRow
              key={leave.id}
              className="hover:bg-gray-100 cursor-default h-10"
            >
              <TableCell className="py-1 text-sm">
                {leave.tblemployees?.first_name} {leave.tblemployees?.last_name}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.tblemployees?.tbldepartments?.department_name || "—"}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.leave_type}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.start_date}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.end_date}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.reason}
              </TableCell>

              <TableCell
                className={`py-1 font-semibold text-sm ${
                  leave.status === "Approved"
                    ? "text-green-600"
                    : leave.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {leave.status}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {new Date(leave.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell className="py-1 text-sm">
                {leave.rejection_reason || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
</CardContent>

      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Reject Leave Request
            </h2>

            <textarea
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-red-600"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error("Rejection reason is required");
                    return;
                  }
                  handleUpdateStatus(
                    selectedLeaveId!,
                    "Rejected",
                    rejectReason
                  );
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveLeave;
