import path from "path";
import ejs from "ejs";

export const resetPasswordTemplate = (templateData: ejs.Data): Promise<string> => {
  const templatePath = path.join(
    __dirname,
    "../templates/ResetEmailTemplate/index.html"
  );
  // const templateData = { resetPasswordLink: "https://example.com" };

  return new Promise((resolve: (value: string) => void, reject) => {
    ejs.renderFile(templatePath, templateData, (err, html) => {
      if (err) {
        reject("Error rendering EJS template:" + err);
      }
      resolve(html);
    });
  });
};
