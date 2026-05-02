import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  title: string;
  filename: string;
  headers: string[];
  data: any[][];
}

export const exportToPDF = ({ title, filename, headers, data }: ExportData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 14, 22);

  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  doc.text(`Generated on: ${dateStr}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${filename}.pdf`);
};
