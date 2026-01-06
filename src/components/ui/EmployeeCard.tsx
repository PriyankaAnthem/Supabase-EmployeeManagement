// src/components/EmployeeCard.tsx
import React from "react";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string | null;
  salary: number | null;
}

interface Props {
  emp: Employee;
  onClose: () => void;
}

export const EmployeeCard = ({ emp, onClose }: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 relative">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Employee Info */}
        <h2 className="text-xl font-bold mb-4">
          {emp.first_name} {emp.last_name}
        </h2>
        <p>
          <strong>Email:</strong> {emp.email}
        </p>
        <p>
          <strong>Hire Date:</strong> {emp.hire_date || "-"}
        </p>
        <p>
          <strong>Salary:</strong> ₹{emp.salary || "-"}
        </p>
      </div>
    </div>
  );
};
