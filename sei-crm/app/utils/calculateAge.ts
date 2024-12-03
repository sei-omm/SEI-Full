export function calculateAge(dob: string) {
  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  // Adjust the years and months if the current month is before the birth month
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years ${months} months`;
}
