import html2pdf from "html2pdf.js";
import { MutableRefObject } from "react";

// export const downloadHtmlToPdf = async (
//   layoutRef: MutableRefObject<HTMLElement | null>
// ) => {
//   const inputData = layoutRef.current;
//   if (!inputData) return;

//   try {
//     const canvas = await html2canvas(inputData);
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "px",
//       format: "a4",
//     });

//     const width = pdf.internal.pageSize.getWidth();
//     // const height = (canvas.height * width) / canvas.width;
//     const height = 1920;

//     pdf.addImage(imgData, "PNG", 0, 0, width, height);
//     pdf.save("Testing.pdf");
//   } catch (error) {
//     alert("Some Error Happen");
//     console.log(error);
//   }
// };

export const downloadHtmlToPdf = async (
  layoutRef: MutableRefObject<HTMLElement | null>
) => {
  const inputData = layoutRef.current;
  if (!inputData) return;

  try {
    const element = layoutRef.current;
    const opt = {
      margin: 0.5,
      filename: "payslip.pdf",
      image: { type: "jpg", quality: 0.92 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };

    // Use html2pdf to generate the PDF
    html2pdf({}).from(element).set(opt).save();
  } catch (error) {
    alert("Some Error Happen");
  }
};