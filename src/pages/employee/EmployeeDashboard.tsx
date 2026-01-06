import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CalendarCheck, ClipboardList, LogIn, LogOut } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  designation?: string;
  department?: string;
}

interface Task {
  id: string;
  task_title: string;
  task_description: string;
  due_date?: string;
  status: string;
  created_at?: string;
}

interface Attendance {
  id: string;
  check_in?: string;
  check_out?: string;
  date: string;
  status: string;
}

interface Leave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const getISTDateTime = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.toISOString().slice(0, 19).replace("T", " ");
};

// Converts any UTC/ISO string → readable IST time in hh:mm:ss AM/PM
const formatIST = (dateStr?: string) => {
  if (!dateStr) return "—";
  const istDate = new Date(
    new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayLeaveStatus, setTodayLeaveStatus] = useState<string | null>(null);

  // ✅ Always return current IST date-time string (accurate even on UTC server)
  const getISTDateTime = () => {
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return ist.toISOString().slice(0, 19).replace("T", " ");
  };

  // ✅ Convert UTC or any date → readable IST format
  const formatIST = (dateStr?: string) => {
    if (!dateStr) return "—";
    const istDate = new Date(
      new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    return istDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // 🔹 Fetch Employee Details
  const fetchEmployee = async (employeeId: number) => {
    const { data, error } = await supabase
      .from("tblemployees")
      .select(`
        employee_id,
        first_name,
        last_name,
        email,
        designation_id,
        department_id,
        tbldesignations ( designation_title ),
        tbldepartments ( department_name )
      `)
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching employee:", error);
      return;
    }

    setEmployee({
      id: data.employee_id,
      name:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        data.email?.split("@")[0] ||
        "Unknown",
      email: data.email || "",
      designation: data.tbldesignations?.designation_title || "Not Assigned",
      department: data.tbldepartments?.department_name || "Not Assigned",
    });
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    const emp = storedEmployee ? JSON.parse(storedEmployee) : null;
    const employeeId = emp?.employee_id;
    if (employeeId) {
      fetchEmployee(employeeId);
      fetchAllData(employeeId);
    }
  }, []);

  const fetchAllData = async (employeeId: number) => {
    await Promise.all([
      fetchTasks(employeeId),
      fetchAttendance(employeeId),
      fetchLeaves(employeeId),
      fetchNotifications(),
    ]);
    await checkIfOnLeave(employeeId);
  };

  // ✅ Attendance
  const fetchAttendance = async (employeeId: number) => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }); // YYYY-MM-DD in IST
    const { data } = await supabase
      .from("tblattendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", today)
      .maybeSingle();
    setAttendance(data);
  };

  // ✅ Check if on leave
  const checkIfOnLeave = async (employeeId: number) => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const { data } = await supabase
      .from("tblleaverequests")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("status", "Approved");

    if (data?.length) {
      const isOnLeave = data.some(
        (leave) => today >= leave.start_date && today <= leave.end_date
      );
      setTodayLeaveStatus(isOnLeave ? "On Leave" : null);
    }
  };

  // ✅ Fetch Tasks
  const fetchTasks = async (employeeId: number) => {
    const { data } = await supabase
      .from("tblemployeetasks")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });
    setTasks(data || []);
  };

  // ✅ Fetch Leaves
  const fetchLeaves = async (employeeId: number) => {
    const { data } = await supabase
      .from("tblleaverequests")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });
    setLeaves(data || []);
  };

  // ✅ Fetch Notifications
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("tblnotifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setNotifications(data || []);
  };

  // ✅ Check-In (IST)
  const handleCheckIn = async () => {
    if (!employee) return;
    setLoading(true);
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const { data: existing } = await supabase
      .from("tblattendance")
      .select("*")
      .eq("employee_id", employee.id)
      .eq("date", today);

    if (existing?.length) {
      alert("You already checked in today!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("tblattendance").insert([
      {
        employee_id: employee.id,
        check_in: getISTDateTime(),
        date: today,
        status: "Present",
      },
    ]);
    setLoading(false);
    if (!error) fetchAttendance(employee.id);
  };

  // ✅ Check-Out (IST)
  const handleCheckOut = async () => {
    if (!employee) return;
    setLoading(true);
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const { error } = await supabase
      .from("tblattendance")
      .update({ check_out: getISTDateTime() })
      .eq("employee_id", employee.id)
      .eq("date", today);
    setLoading(false);
    if (!error) fetchAttendance(employee.id);
  };

  // ✨ Marquee CSS
  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-marquee {
      display: inline-block;
      animation: marquee 12s linear infinite;
      white-space: nowrap;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `;

  return (
    <>
      <style>{marqueeStyle}</style>
      <div className="min-h-screen bg-gray-50">
        {/* 🔷 Welcome Banner */}
        <div className="bg-[#001F7A] text-white py-3 overflow-hidden">
          <div className="animate-marquee text-center text-lg font-semibold">
            👋 Welcome back, {employee?.name || "Employee"} — Have a productive day!
          </div>
        </div>

        {/* Main Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 🔹 Left Column */}
          <div className="space-y-6">
            {/* Tasks */}
            <Card className="border shadow-md"
            style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
            onClick={() => navigate("/employee/task-status")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <ClipboardList className="h-5 w-5" /> Assigned Tasks
                </CardTitle>
              </CardHeader>
              <CardContent style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
                {tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map((task) => (
                      <li key={task.id} className="border p-2 rounded-md bg-gray-50"
                      style={{
              background: "linear-gradient(-45deg, #eef1ff, #c9d0fb)",
            }}
                      >
                        <p className="text-sm font-bold text-gray-900 mb-1">

                          {task.task_title}
                       </p>
                        <p className="text-xs text-black-500 mb-1">
                          Due:{" "}
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString("en-IN")
                            : "Not Set"}
                        </p>
                        <p className="text-sm text-black-600">
                          {task.task_description || "No description"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tasks assigned yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Leave */}
            <Card
              className="border shadow-md cursor-pointer"
              onClick={() => navigate("/employee/apply-leave")}
              style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <CalendarCheck className="h-5 w-5" /> My Leaves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-[#001F7A] mb-2">
                  Leave Taken: {leaves.filter((l) => l.status === "Approved").length}
                </p>
                {leaves.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {leaves.slice(0, 2).map((leave) => (
                      <li
                        key={leave.id}
                        className="flex justify-between border-b py-1 text-gray-700"
                      >
                        <span>{leave.leave_type}</span>
                        <span
                          className={`${
                            leave.status === "Approved"
                              ? "text-green-600"
                              : leave.status === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No leave records.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🔸 Middle Column */}
<div className="space-y-6">
  <Card className="border shadow-md text-center" 
   style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
  >
    <CardHeader>
      <CardTitle className="flex items-center justify-center gap-2 text-[#001F7A]">
        <CalendarCheck className="h-5 w-5" /> Attendance (
        {new Date().toLocaleDateString("en-IN")})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {attendance?.check_in && !attendance.check_out ? (
        <Button
          className="bg-blue-900 hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          onClick={handleCheckOut}
          disabled={loading}
        >
          <LogOut className="mr-2 h-5 w-5" /> Check Out
        </Button>
      ) : !attendance?.check_in ? (
        <Button
          className="bg-blue-900 hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          onClick={handleCheckIn}
          disabled={loading}
        >
          <LogIn className="mr-2 h-5 w-5" /> Check In
        </Button>
      ) : (
        <p className="text-gray-500 font-medium">You have completed attendance for today.</p>
      )}
    </CardContent>
  </Card>
</div>


          {/* 🔷 Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
           {/* Notifications */}
<Card
  className="border shadow-md"
  style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
>
  <CardHeader>
    <CardTitle className="text-[#001F7A] flex items-center gap-2">
      <Bell className="h-5 w-5" /> Notifications
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* ✅ Today's Notifications */}
    <div>
      <h3 className="font-semibold text-blue-900 mb-2">Today's Notifications</h3>
      {(() => {
        const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const todays = notifications.filter((n) => {
          const createdAtIST = new Date(
            new Date(n.created_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          )
            .toISOString()
            .slice(0, 10); // yyyy-mm-dd
          return createdAtIST === todayIST;
        });

        if (todays.length === 0) {
          return <p className="text-gray-500 text-sm">No notification yet.</p>;
        }

        return (
          <ul className="space-y-2 text-sm">
            {todays.map((note) => (
              <li key={note.id} className="border-b pb-2">
                <strong>{note.title}</strong>
                <p className="text-gray-600">{note.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        );
      })()}
    </div>

    {/* ✅ Old Notification (most recent older one) */}
    <div>
      <h3 className="font-semibold text-blue-900 mb-2">Old Notification</h3>
      {(() => {
        const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const old = notifications
          .filter((n) => {
            const createdAtIST = new Date(
              new Date(n.created_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            )
              .toISOString()
              .slice(0, 10);
            return createdAtIST !== todayIST;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        if (!old) {
          return <p className="text-gray-500 text-sm">No older notifications.</p>;
        }

        return (
          <div className="border-b pb-2 text-sm">
            <strong>{old.title}</strong>
            <p className="text-gray-600">{old.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(old.created_at).toLocaleString("en-IN")}
            </p>
          </div>
        );
      })()}
    </div>
  </CardContent>
</Card>

            {/* Today's Overview */}
            <Card
            onClick={() => navigate("/employee/monthly-report")}  
            className="border shadow-md"
            style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
              <CardHeader>
                <CardTitle className="text-[#001F7A] flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" /> Today’s Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date().toLocaleDateString("en-IN")}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {todayLeaveStatus || attendance?.status || "Not Marked"}
                  </p>
                  <p>
                    <strong>Check-In:</strong> {formatIST(attendance?.check_in)}
                  </p>
                  <p>
                    <strong>Check-Out:</strong> {formatIST(attendance?.check_out)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
