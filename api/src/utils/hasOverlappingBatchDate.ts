// import { TCourseBatches } from "../type";

export const hasOverlappingBatchDate = (courses: any[]): boolean =>  {
  // Sort courses by start_date
  courses.sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  for (let i = 0; i < courses.length - 1; i++) {
    const currentEnd = new Date(courses[i].end_date).getTime();
    const nextStart = new Date(courses[i + 1].start_date).getTime();

    // If current course's end date is greater than or equal to the next course's start date, overlap exists
    if (currentEnd >= nextStart) {
      return true; // Overlapping courses found
    }
  }
  return false; // No overlaps
}
