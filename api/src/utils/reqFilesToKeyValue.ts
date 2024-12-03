import { Request } from "express";

export const reqFilesToKeyValue = (req: Request) => {
  const files: { [key: string]: Express.Multer.File[] } = req.files as {
    [key: string]: Express.Multer.File[];
  };

  const fileObj: any = {};
  Object.entries(files).map(([key, value]) => {
    fileObj[key] = value[0].path.replace(/\\/g, "/");
  });

  return fileObj;
};
