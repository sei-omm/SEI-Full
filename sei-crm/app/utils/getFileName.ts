export const getFileName = (path ? : string) => {
  if(!path) return undefined;
  const list = path.split("/");
  return list[list.length - 1];
};
