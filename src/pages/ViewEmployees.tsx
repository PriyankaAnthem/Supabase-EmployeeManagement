// src/pages/ViewEmployees.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string | null;
  salary: number | null;
  department_id: number | null;
  designation_id: number | null;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Designation {
  designation_id: number;
  designation_title: string;
}

const EmployeeCard: React.FC<{ emp: Employee; designation?: string }> = ({ emp, designation }) => (
  <div className="bg-white rounded-xl shadow hover:shadow-lg p-4 border border-gray-200 transition transform hover:-translate-y-1">
    <h2 className="text-lg font-semibold mb-1">
      {emp.first_name} {emp.last_name}{" "}
      {designation && <span className="font-bold">({designation})</span>}
    </h2>
    <p className="text-sm text-gray-600">
      <strong>Email:</strong> {emp.email}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Hire Date:</strong>{" "}
      {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString("en-GB") : "-"}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Salary:</strong> {emp.salary ? `₹${emp.salary.toLocaleString()}` : "Not Set"}
    </p>
  </div>
);


const ViewEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [activeDept, setActiveDept] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newEmployeeMsg, setNewEmployeeMsg] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResult, departmentsResult, designationsResult] = await Promise.all([
        supabase.from("tblemployees").select("*"),
        supabase.from("tbldepartments").select("*"),
        supabase.from("tbldesignations").select("*"),
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (departmentsResult.error) throw departmentsResult.error;
      if (designationsResult.error) throw designationsResult.error;

      setEmployees(employeesResult.data || []);
      setDepartments(departmentsResult.data || []);
      setDesignations(designationsResult.data || []);
    } catch (error) {
      console.error("Data fetch error:", error);
    }
  };

  // Get employees for a department, newest first
  const getDepartmentEmployees = (deptId: number) =>
    employees
      .filter((emp) => emp.department_id === deptId)
      .sort((a, b) => b.employee_id - a.employee_id); // Newest first

  const getDesignationTitle = (id: number | null) =>
    designations.find((d) => d.designation_id === id)?.designation_title;

  // Uncategorized employees (no department or no designation)
  const uncategorizedEmployees = employees.filter(
    (emp) => !emp.department_id || !emp.designation_id
  );

  // Call this whenever a new employee is added
  const handleNewEmployee = (emp: Employee) => {
    const deptName = emp.department_id
      ? departments.find((d) => d.department_id === emp.department_id)?.department_name
      : "No confirmed department";
    const designationName = emp.designation_id
      ? designations.find((d) => d.designation_id === emp.designation_id)?.designation_title
      : "Not confirmed role";

    setNewEmployeeMsg(`A new employee is added to ${deptName} in ${designationName}`);
    fetchData();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          className="w-64 border-r border-gray-200 p-4 overflow-y-auto transition-all duration-300"
          style={{ background: "linear-gradient(-45deg, #ffffff, #6C7ACF)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Departments</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ul className="space-y-2">
            {departments.map((dept) => {
              const empCount = getDepartmentEmployees(dept.department_id).length;
              const isActive = activeDept === dept.department_id;

              return (
                <li key={dept.department_id}>
                  <button
                    onClick={() => setActiveDept(isActive ? null : dept.department_id)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-blue-100 text-gray-800 font-medium"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{dept.department_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-sm ${
                        empCount > 0
                          ? "bg-gray-200 text-blue-800"
                          : "bg-gray-300 text-blue-700"
                      }`}
                    >
                      {empCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
          </div>
        </div>

        {/* New Employee Notification */}
        {newEmployeeMsg && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded text-green-800">
            {newEmployeeMsg}
          </div>
        )}

        {/* Uncategorized Employees */}
        {uncategorizedEmployees.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-700">
              
              No Confirmed Department / Not Confirmed Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uncategorizedEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.employee_id}
                  emp={emp}
                  designation={
                    emp.designation_id
                      ? getDesignationTitle(emp.designation_id)
                      : "Not Assigned"
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Department Employees */}
        {activeDept === null ? (
          <p className="text-black-600">Select a department from the sidebar.</p>
        ) : (() => {
          const dept = departments.find((d) => d.department_id === activeDept);
          const deptEmployees = getDepartmentEmployees(activeDept);

          return (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                {dept?.department_name}
              </h2>
              {deptEmployees.length === 0 ? (
                <p className="text-gray-500">No employees in this department.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deptEmployees.map((emp) => (
                    <EmployeeCard
                      key={emp.employee_id}
                      emp={emp}
                      designation={getDesignationTitle(emp.designation_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default ViewEmployees;
