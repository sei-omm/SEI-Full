import path from "path";
import ejs from "ejs";

export const generateHappyBirthdayEmail = (templateData: ejs.Data): Promise<string> => {
    const templatePath = path.join(
      __dirname,
      "../templates/BirthdateWishTemplate/index.html"
    );
  
    return new Promise((resolve: (value: string) => void, reject) => {
      ejs.renderFile(templatePath, templateData, (err, html) => {
        if (err) {
          reject("Error rendering EJS template:" + err);
        }
        resolve(html);
      });
    });
  };