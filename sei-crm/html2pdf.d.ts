declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | string;
      filename?: string;
      image?: { type: string; quality: number };
      jsPDF?: any;
      html2canvas?: any;
    }
  
    interface Html2Pdf {
      (options: Html2PdfOptions): any;
      from(element: HTMLElement): Html2Pdf;
      toPdf(): any;
      save(): void;
    }
  
    const html2pdf: Html2Pdf;
    export = html2pdf;
  }
  