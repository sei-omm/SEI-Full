export function parseNullOrUndefined(value: string) {
  if(value === "0") return null;
  if (value === "null") return null;
  if (value === "undefined") return undefined;
  return value;
}
