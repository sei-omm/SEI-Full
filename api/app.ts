import express from "express";

const app = express();

type TFacultyDetails = {
  subject: string; // comma separated string
  faculty_id: number;
  faculty_name: string;
  max_teaching_hrs_per_week: string;
  faculty_current_working_hours: number;
  is_active: boolean;
  profile_image: string;
};

type InfoType = {
  course_id: number;
  course_name: string;
  course_code: string;
  subjects: string; // comma separated string
  faculty_details: TFacultyDetails[];
};

type TFaculty = {
  for_subject_name: string;
  faculty_id: number;
  faculty_name: string;
  profile_image: string;
};

type TTimeTable = {
  course_id: number;
  course_name: string;
  course_code: string;
  subjects: string[];
  faculty: TFaculty[];
};

type TMapData = {
  pIndex: number;
  facPosition: number;
  forSubject: string;
  actualIndex: number;
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
      {
        subject: "NCS 1",
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
    course_id: 10,
    course_name: "Course 1",
    course_code: "C1",
    subjects: "Math,Histroy,Bengli,English\\",
    faculty_details: [],
  },
];

const findOtherFaculty = (
  facultyList: TFacultyDetails[],
  ignoreFacId: number,
  cSubject: string,
  map: Map<number, TMapData>
) => {
  for (let i = 0; i < facultyList.length; i++) {
    if (facultyList[i].faculty_id !== ignoreFacId) {
      const existAnyWhere = map.get(facultyList[i].faculty_id);
      if (
        facultyList[i].subject.includes(cSubject) &&
        existAnyWhere &&
        existAnyWhere.facPosition > 0
      ) {
        return facultyList[i];
      }
    }
  }

  return null;
};

app.get("/", (req, res) => {
  const results: TTimeTable[] = [];
  const map = new Map<number, TMapData>();

  outputs.forEach((output, pIndex) => {
    const subjects = output.subjects.split(",");

    const time_table: TTimeTable = {
      course_name: output.course_name,
      course_code: output.course_code,
      course_id: output.course_id,
      subjects: subjects,
      faculty: [],
    };

    //
    subjects.forEach((subject) => {
      const current_fac_array: TFaculty[] = [];
      const temp: TFaculty[] = [];

      output.faculty_details.forEach((loopFac) => {
        // check current employee teaching current subject or not
        if (loopFac.subject.includes(subject)) {
          const facInfoToStore = {
            faculty_id: loopFac.faculty_id,
            faculty_name: loopFac.faculty_name,
            for_subject_name: subject,
            profile_image: loopFac.profile_image,
          };
          const myCurrentPosition = time_table.faculty.filter(
            (item) => item.for_subject_name === subject
          ).length;
          const mapInfo = map.get(loopFac.faculty_id);
          if (mapInfo && mapInfo.facPosition === 0 && myCurrentPosition === 0) {
            // temp.push(facInfoToStore)
            //check is there anyone with same subject selected for first position

            const avilableFac = findOtherFaculty(
              outputs[mapInfo.pIndex].faculty_details,
              loopFac.faculty_id,
              subject,
              map
            );

            // if(!avilableFac) {

            // }
            console.log("__START__");
            // console.log(outputs[mapInfo.pIndex].faculty_details)
            console.log(avilableFac);
          } else {
            // time_table.faculty.push(facInfoToStore)
            current_fac_array.push(facInfoToStore);

            map.set(loopFac.faculty_id, {
              pIndex,
              facPosition: myCurrentPosition,
              forSubject: subject,
              actualIndex: time_table.faculty.length,
            });
          }
        }
      });

      if (current_fac_array.length === 0 && temp.length !== 0) {
        current_fac_array.push({
          faculty_id: -1,
          faculty_name: "Choose Faculty",
          for_subject_name: subject,
          profile_image: "",
        });
      }

      current_fac_array.push(...temp);

      time_table.faculty.push(...current_fac_array);
    });

    results.push(time_table);
  });

  // results.forEach((result, pIndex) => {

  //     result.subjects.forEach(subject => {
  //         let position = -1;
  //         result.faculty.forEach(eFaculty => {

  //             if(subject === eFaculty.for_subject_name) {
  //                 position++;

  //                 const mapInfo = map.get(eFaculty.faculty_id);
  //                 if(mapInfo && mapInfo.facPosition === 0 && position === 0) {

  //                     function findOtherFaculty (fArray : TFaculty[], subj : string) {
  //                         const secoundPosiFac = fArray.find(item => item.for_subject_name === subj);
  //                         if(!secoundPosiFac) return null;
  //                         const mapInfo = map.get(secoundPosiFac.faculty_id);
  //                         if(mapInfo && mapInfo.facPosition === 0) {
  //                             return findOtherFaculty(fArray.filter(item => item.faculty_id !== secoundPosiFac.faculty_id), secoundPosiFac.for_subject_name)
  //                         }
  //                         return secoundPosiFac;
  //                     }

  //                     const otherFaculty = findOtherFaculty(results[mapInfo.pIndex].faculty.filter(item => item.faculty_id !== eFaculty.faculty_id), eFaculty.for_subject_name);

  //                 } else {
  //                     map.set(eFaculty.faculty_id, {
  //                         pIndex,
  //                         facPosition : position,
  //                         forSubject : subject
  //                     })
  //                 }
  //             }

  //         })

  //         // map.forEach((value, key) => {
  //         //     console.log(key, " : ", value);
  //         // })
  //         // console.log("__DONE__")

  //     })

  // })

  res.status(200).json(results);
});

app.get("/test", (req, res) => {
  res.json(outputs);
});

app.listen(8080, () => console.log("http://localhost:8080"));
