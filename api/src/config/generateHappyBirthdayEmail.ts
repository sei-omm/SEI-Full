import path from "path";
import ejs from "ejs";

export const generateHappyBirthdayEmail = (templateData: ejs.Data): Promise<string> => {
    const templatePath = path.resolve(__dirname, "../../public/templates/birthdate-wish.html")
  
    return new Promise((resolve: (value: string) => void, reject) => {
      ejs.renderFile(templatePath, templateData, (err, html) => {
        if (err) {
          reject("Error rendering EJS template:" + err);
        }
        resolve(html);
      });
    });
  };