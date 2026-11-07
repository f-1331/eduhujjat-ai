import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportCertificateToPdf(elementId, filename = "Faxriy_Yorliq.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  // A4 albom yo'nalishi (landscape: 297 x 210 mm)
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
