import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";


function MonthlyReport() {
  const [records, setRecords] = useState<any[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  // Load employee ID
  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      if (emp?.employee_id) setEmployeeId(emp.employee_id);
    }
  }, []);

  useEffect(() => {
    if (employeeId !== null) fetchAttendance();
  }, [employeeId, month, year]);

  // Fetch attendance from Supabase
  const fetchAttendance = async () => {
    if (employeeId === null) return;

    try {
      setLoading(true);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

      const { data, error } = await supabase
        .from("tblattendance")
        .select("date, check_in, check_out, status")
        .eq("employee_id", employeeId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      console.error("Error fetching report:", err);
      toast({
        title: "Error fetching report",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Present":
        return "bg-green-500";
      case "Absent":
        return "bg-red-500";
      case "Late":
        return "bg-orange-400";
      default:
        return "bg-gray-300";
    }
  };

  // Generate all calendar cells
  const generateCalendarDays = () => {
  if (!employeeId) return [];

  // Determine first day to start counting: first check-in
  const firstRecord = records.length > 0 ? new Date(records[0].date) : null;
  if (!firstRecord) return []; // No attendance yet

  const lastDay = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();
  const days: (any | null)[] = [];
  const today = new Date();

  // Fill empty cells for calendar alignment
  for (let i = 0; i < firstDayWeekday; i++) days.push(null);

  for (let day = 1; day <= lastDay; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Skip days before first check-in
    if (currentDate < firstRecord) {
      days.push({ day, status: undefined, check_in: null, check_out: null });
      continue;
    }

    const record = records.find((r) => r.date === dateStr);

    let status;
    if (record?.status) {
      status = record.status;
    } else if (
      currentDate.getDay() !== 0 && 
      currentDate.getDay() !== 6 && 
      currentDate <= today
    ) {
      // Weekdays (Mon-Fri) from first check-in to today with no record -> Absent
      status = "Absent";
    } else {
      // Weekends or future dates
      status = undefined;
    }

    days.push({
      day,
      status,
      check_in: record?.check_in || null,
      check_out: record?.check_out || null,
    });
  }

  return days;
};


  const calendarDays = generateCalendarDays();

  // Next / Previous Month Handlers
  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  // Print as PDF
  const handlePrint = () => {
    const printContent = document.getElementById("calendar-report");
    if (!printContent) return;

    const newWindow = window.open("", "", "width=900,height=700");
    newWindow!.document.write(`
      <html>
        <head>
          <title>Monthly Attendance Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
            .day-box { height: 80px; padding: 5px; text-align: center; border-radius: 8px; color: white; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    newWindow!.document.close();
    newWindow!.print();
  };

  if (employeeId === null)
    return (
      <div className="min-h-screen flex justify-center items-center flex-col gap-4">
        <p className="text-gray-500 text-lg">Please log in to view your attendance report.</p>
        <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex justify-center py-10 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border w-full max-w-4xl">

          {/* Modern Header */}
          <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-4 mb-4">
    <Button
      onClick={goToPreviousMonth}
      className="w-12 h-12 rounded-full flex items-center justify-center 
                 bg-blue-900 text-white shadow-md hover:shadow-lg transition 
                 hover:bg-blue-800 active:scale-95"
    >
       <ChevronLeft className="w-5 h-5" />
    </Button>

    <h2 className="text-2xl font-bold text-blue-900">
      {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
    </h2>

    <Button
      onClick={goToNextMonth}
      className="w-12 h-12 rounded-full flex items-center justify-center 
                 bg-blue-900 text-white shadow-md hover:shadow-lg transition 
                 hover:bg-blue-800 active:scale-95"
    >
       <ChevronRight className="w-5 h-5" />
    </Button>
  </div>

            {/* Month-Year Select */}
            <div className="flex gap-4">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-blue-900 text-white"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-blue-900 text-white"
              >
                {[2021, 2022, 2023, 2024, 2025].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <Button
              className="mt-4 bg-blue-900 hover:bg-blue-800 text-white"
              onClick={handlePrint}
            >
              Download / Print PDF
            </Button>
          </div>

          {/* Color Legend */}
          <div className="flex gap-6 justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">Present</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm font-medium">Late</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">Absent</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm font-medium">No Data</span>
            </div>
          </div>

          {/* Printable Calendar */}
          <div id="calendar-report" className="p-4 bg-white rounded-xl border shadow-sm">

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-semibold text-blue-900">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((d, idx) =>
                d ? (
                  <div
                    key={idx}
                    className={`h-20 flex flex-col items-center justify-center rounded-lg text-white text-xs p-1 ${getStatusColor(
                      d.status
                    )}`}
                  >
                    <span className="font-bold">{d.day}</span>

                    <span className="text-[10px]">
                      {d.check_in
                        ? new Date(d.check_in).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </span>

                    <span className="text-[10px]">
                      {d.check_out
                        ? new Date(d.check_out).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </span>
                  </div>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default MonthlyReport;
