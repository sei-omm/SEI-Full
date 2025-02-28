import express from "express";

const app = express();

type InfoType = {
  course_id: number;
  course_name: string;
  course_code: string;
  subjects: string; // comma separated string
  faculty_details: {
    subject: string; // comma separated string
    faculty_id: number;
    faculty_name: string;
    max_teaching_hrs_per_week: string;
    faculty_current_working_hours: number;
    is_active: boolean;
    profile_image: string;
  }[];
};

type TFaculty = {
  for_subject_name: string;
  faculty_id: number;
  faculty_name: string;
  profile_image: string;
  belong_position: number;
};

type TTimeTable = {
  course_id: number;
  course_name: string;
  course_code: string;
  subjects: string[];
  faculty: TFaculty[];
};

const outputs: InfoType[] = [
  {
    course_id: 11,
    course_name: "Course 2",
    course_code: "C2",
    subjects: "Math,History,Geo,Health",
    faculty_details: [],
  },
  {
    course_id: 16,
    course_name: "New Course 2",
    course_code: "NC2",
    subjects: "NCS2 1,NCS2 2,NCS2 3,NCS2 4",
    faculty_details: [
      {
        subject: "NCS2 1",
        is_active: true,
        faculty_id: 2,
        faculty_name: "NEERAJ K MAHESHWARI",
        profile_image:
          "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/studient-icon-oWRZc5AHP4eSi1nHHBSb2sBBVq4NXg.jpg",
        max_teaching_hrs_per_week: "18",
        faculty_current_working_hours: 0,
      },
      {
        subject: "NCS2 2",
        is_active: true,
        faculty_id: 22,
        faculty_name: "Fac 1",
        profile_image:
          "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/employee-profile/Screenshot%20(5)-fOLyGUb93Z4UW3jVQm1FLtFPu55774.png",
        max_teaching_hrs_per_week: "5",
        faculty_current_working_hours: 0,
      },
      {
        subject: "NCS2 1",
        is_active: true,
        faculty_id: 23,
        faculty_name: "New FAC",
        profile_image:
          "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/employee-profile/Screenshot%20(4)-EtPeiEzIauDkAvJyM9RvBdHYxRcGya.png",
        max_teaching_hrs_per_week: "18",
        faculty_current_working_hours: 0,
      },
    ],
  },
  {
    course_id: 15,
    course_name: "New Course 1",
    course_code: "NC1",
    subjects: "NCS 1,NCS 2,NCS 3,NCS 4,NCS 5",
    faculty_details: [
      {
        subject: "NCS 1,NCS 2",
        is_active: true,
        faculty_id: 2,
        faculty_name: "NEERAJ K MAHESHWARI",
        profile_image:
          "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/studient-icon-oWRZc5AHP4eSi1nHHBSb2sBBVq4NXg.jpg",
        max_teaching_hrs_per_week: "18",
        faculty_current_working_hours: 0,
      },
      {
        subject: "NCS 2",
        is_active: true,
        faculty_id: 22,
        faculty_name: "Fac 1",
        profile_image:
          "https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/employee-profile/Screenshot%20(5)-fOLyGUb93Z4UW3jVQm1FLtFPu55774.png",
        max_teaching_hrs_per_week: "5",
        faculty_current_working_hours: 0,
      },
    ],
  },
  {
    course_id: 10,
    course_name: "Course 1",
    course_code: "C1",
    subjects: "Math,Histroy,Bengli,English\\",
    faculty_details: [],
  },
];

app.get("/", (req, res) => {
  const result: TTimeTable[] = [];
  const faculty_exist_position = new Map<
    number,
    {
      belong_position: number;
    }
  >();

  outputs.forEach((output) => {
    const subjects = output.subjects.split(",");

    const time_table: TTimeTable = {
      course_name: output.course_name,
      course_code: output.course_code,
      course_id: output.course_id,
      subjects: subjects,
      faculty: [],
    };

    const tempFaculty: TFaculty[] = [];
    subjects.forEach((subject) => {
      output.faculty_details.forEach((faculty) => {
        // check current employee teaching current subject or not
        if (faculty.subject.includes(subject)) {
          const exist_faculty = faculty_exist_position.get(faculty.faculty_id);

          if (!exist_faculty || exist_faculty.belong_position > 0) {
            const belong_position = time_table.faculty.filter(
              (item) => item.for_subject_name === subject
            ).length;
            time_table.faculty.push({
              faculty_id: faculty.faculty_id,
              faculty_name: faculty.faculty_name,
              for_subject_name: subject,
              profile_image: faculty.profile_image,
              belong_position: belong_position,
            });

            faculty_exist_position.set(faculty.faculty_id, {
              belong_position: belong_position,
            });
          } else {
            const belong_position = time_table.faculty.filter(item => item.for_subject_name === subject).length;
            time_table.faculty.push({
                faculty_id: -1,
                faculty_name: "Choose Faculty",
                for_subject_name: subject,
                profile_image: "",
                belong_position: belong_position
            });
            tempFaculty.push({
                faculty_id: faculty.faculty_id,
                faculty_name: faculty.faculty_name,
                for_subject_name: subject,
                profile_image: faculty.profile_image,
                belong_position: belong_position + 1
            });

          }
        }
      });
    });

    time_table.faculty.push(...tempFaculty);

    result.push(time_table);
  });

  res.status(200).json(result);
});

app.get("/test", (req, res) => {
  res.json(outputs);
});

app.listen(8080, () => console.log("http://localhost:8080"));
