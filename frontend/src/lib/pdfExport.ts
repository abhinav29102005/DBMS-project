import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface ExportData {
  title: string;
  filename: string;
  headers: string[];
  data: any[][];
  qrDataIndex?: number; // Index of the column that contains the QR data
}

export const exportToPDF = async ({ title, filename, headers, data, qrDataIndex }: ExportData) => {
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

  // Prepare data with QR codes if needed
  const tableData = [...data];
  
  if (qrDataIndex !== undefined) {
    for (let i = 0; i < tableData.length; i++) {
      const qrValue = tableData[i][qrDataIndex];
      if (qrValue) {
        const qrDataUrl = await QRCode.toDataURL(qrValue, { margin: 1 });
        tableData[i][qrDataIndex] = { content: '', image: qrDataUrl };
      }
    }
  }

  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawCell: (data) => {
      if (qrDataIndex !== undefined && data.column.index === qrDataIndex && data.cell.raw && (data.cell.raw as any).image) {
        const img = (data.cell.raw as any).image;
        doc.addImage(img, 'PNG', data.cell.x + 2, data.cell.y + 2, 10, 10);
      }
    },
  });

  doc.save(`${filename}.pdf`);
};
