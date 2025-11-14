import jsPDF from 'jspdf';

export const generateStatementPDF = (studentName: string, transactions: any[]) => {
  const doc = new jsPDF();
  doc.text(`Statement for ${studentName}`, 10, 10);
  let y = 20;
  transactions.forEach(t => {
    doc.text(`${t.description} - Paid: ${t.Payments} - Due: ${t.Fees_Levies}`, 10, y);
    y += 10;
  });
  doc.save(`${studentName}_statement.pdf`);
};
