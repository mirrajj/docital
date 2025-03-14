import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add this function to your component
const exportToPDF = () => {
  // Initialize PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Audit Reports', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
  
  // Define table header
  const tableColumn = [
    "Audit Type", 
    "Conducted By", 
    "Department", 
    "Scheduled Date", 
    "Completion Date", 
    "Status", 
    "Score"
  ];
  
  // Map the data to match the headers
  const tableRows = audits.map(item => [
    item.audit_type,
    item.conducted_by,
    item.department.name,
    item.scheduled_date,
    item.completed_at,
    item.status,
    item.compliance_score
  ]);
  
  // Generate the table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 30 }
  });
  
  // Save the PDF
  doc.save('audit-reports.pdf');
};