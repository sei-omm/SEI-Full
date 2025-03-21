import path from "path";
import ejs from "ejs";

export const sendOtpTemplate = (templateData: ejs.Data): Promise<string> => {
  const templatePath = path.resolve(__dirname, "../../public/templates/otp.html")
  const existTemplateDate = {...templateData, hostname : process.env.HOST_NAME};
  
  return new Promise((resolve: (value: string) => void, reject) => {
    ejs.renderFile(templatePath, existTemplateDate, (err, html) => {
      if (err) {
        reject("Error rendering EJS template:" + err);
      }
      resolve(html);
    });
  });
};
