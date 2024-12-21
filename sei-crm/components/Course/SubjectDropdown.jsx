import React, { useState } from 'react';

const SubjectDropdown = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const subjects = ['Math', 'Computer', 'History', 'Science', 'Geography'];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubjects((prev) => [...prev, subject]);
  };

  const handleRemoveSubject = (subject) => {
    setSelectedSubjects((prev) => prev.filter((item) => item !== subject));
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-64">
      {/* Selected Subjects */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSubjects.map((subject, index) => (
          <span
            key={index}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg flex items-center"
          >
            {subject}
            <span
              className="ml-2 cursor-pointer text-gray-500"
              onClick={() => handleRemoveSubject(subject)}
            >
              ×
            </span>
          </span>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Choose Subjects"
        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Dropdown List */}
      <div className="absolute top-12 left-0 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md mt-1 z-10 shadow-lg">
        {filteredSubjects.map((subject) => (
          <div
            key={subject}
            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            onClick={() => handleSelectSubject(subject)}
          >
            {subject}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectDropdown;
