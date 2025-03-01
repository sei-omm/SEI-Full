"use client";

import React, { useState } from "react";

const FacultyTable = () => {
  const [selectedFaculties, setSelectedFaculties] = useState<{ [key: string]: boolean }>({});

  const faculties = [
    { id: "f1", name: "Faculty 1" },
    { id: "f2", name: "Faculty 2" },
    { id: "f3", name: "Faculty 3" },
  ];

  const handleSelectChange = (facultyId: string, isSelected: boolean) => {
    setSelectedFaculties((prev) => ({
      ...prev,
      [facultyId]: isSelected,
    }));
  };

  const isFacultySelected = (facultyId: string) => {
    return selectedFaculties[facultyId] === true;
  };

  return (
    <table border={1}>
      <thead>
        <tr>
          <th>Faculty Name</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        {faculties.map((faculty) => (
          <tr key={faculty.id}>
            <td>{faculty.name}</td>
            <td>
              <select
                value={isFacultySelected(faculty.id) ? "selected" : ""}
                onChange={(e) => handleSelectChange(faculty.id, e.target.value === "selected")}
              >
                <option value="">Not Selected</option>
                <option value="selected">Selected</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FacultyTable;
