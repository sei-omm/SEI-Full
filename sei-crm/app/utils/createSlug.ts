export function createSlug(title: string): string {
  return title
    .toLowerCase() // Convert the string to lowercase.
    .trim() // Remove whitespace from both ends.
    .replace(/[^a-z0-9]+/g, "-") // Replace one or more non-alphanumeric characters with a hyphen.
    .replace(/^-+|-+$/g, ""); // Remove any leading or trailing hyphens.
}
