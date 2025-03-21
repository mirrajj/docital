import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import supabase from '@/config/supabaseClient';

// Function to generate and download audit PDF
export const downloadAuditReport = async (audit) => {
  try {
    // Fetch audit responses for this audit
    const { data: auditResponses, error: responsesError } = await supabase
      .from('audit_responses')
      .select('*')
      .eq('audit_id', audit.audit_id);
    
    if (responsesError) throw responsesError;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(23, 97, 43); // Green color (#17612B)
    doc.text('Audit Report', pageWidth / 2, 20, { align: 'center' });
    
    // Add audit details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Audit Details', 14, 30);
    
    // Create audit details table
    const auditDetails = [
      ['Audit Title', audit.audit_title],
      ['Audit Type', audit.audit_type],
      ['Department', audit.department.name],
      ['Status', audit.status],
      ['Scheduled Date', formatDate(audit.scheduled_date)],
      ['Completed Date', audit.completed_at ? formatDate(audit.completed_at) : 'Not completed'],
      ['Compliance Score', audit.compliance_score ? `${audit.compliance_score}%` : 'N/A'],
      ['Assigned To', audit.assigned_to],
      ['Reviewed By', audit.reviewed_by || 'N/A'],
      ['Findings', audit.findings || 'No findings recorded']
    ];
    
    doc.autoTable({
      startY: 35,
      head: [],
      body: auditDetails,
      theme: 'grid',
      styles: {
        cellPadding: 5,
        fontSize: 10,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });
    
    // Add responses section
    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(14);
    doc.text('Audit Responses', 14, finalY + 10);
    
    // Process responses
    if (auditResponses && auditResponses.length > 0) {
      let currentY = finalY + 15;
      
      for (let i = 0; i < auditResponses.length; i++) {
        const response = auditResponses[i];
        
        // Check if need to add a new page
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }
        
        // Get response data
        const responseData = response.response_value;
        const evidenceUrls = response.evidence_files_urls || [];
        
        // Create table for each response
        const responseRows = [];
        
        // Process response_value which is a key-value pair
        if (responseData && typeof responseData === 'object') {
          Object.entries(responseData).forEach(([question, answer]) => {
            responseRows.push([question, answer.toString()]);
          });
        }
        
        if (responseRows.length > 0) {
          doc.autoTable({
            startY: currentY,
            head: [['Question', 'Response']],
            body: responseRows,
            theme: 'striped',
            headStyles: {
              fillColor: [22, 163, 74], // Green color (#16a34a)
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            styles: {
              cellPadding: 5,
              fontSize: 9,
              overflow: 'linebreak',
              lineColor: [200, 200, 200],
              lineWidth: 0.1,
            },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 90 },
              1: { cellWidth: 90 }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 10;
        }
        
        // Process evidence files
        if (evidenceUrls && evidenceUrls.length > 0) {
          doc.setFontSize(12);
          doc.text('Evidence Files:', 14, currentY);
          currentY += 10;
          
          for (let j = 0; j < evidenceUrls.length; j++) {
            const url = evidenceUrls[j];
            
            // Check if we need a new page for QR codes
            if (currentY > doc.internal.pageSize.getHeight() - 50) {
              doc.addPage();
              currentY = 20;
            }
            
            try {
              // Generate QR code for each url
              const qrCodeDataUrl = await QRCode.toDataURL(url, { 
                margin: 1,
                width: 100 
              });
              
              // Add QR code to the PDF
              doc.addImage(qrCodeDataUrl, 'PNG', 14, currentY, 30, 30);
              
              // Add the URL text
              doc.setFontSize(8);
              doc.text(url, 50, currentY + 15, { maxWidth: 140 });
              
              currentY += 40;
            } catch (qrError) {
              console.error('Error generating QR code:', qrError);
              doc.text(`Evidence URL (QR error): ${url}`, 14, currentY);
              currentY += 10;
            }
          }
        }
        
        currentY += 10;
      }
    } else {
      doc.setFontSize(12);
      doc.text('No responses recorded for this audit.', 14, finalY + 20);
    }
    
    // Add footer with date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Footer with page numbers and date
      const footerText = `Report generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`;
      doc.text(footerText, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`Audit_Report_${audit.audit_title.replace(/\s+/g, '_')}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error downloading audit report:', error);
    return false;
  }
};

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// Function to be used in the AuditList component
export const handleDownloadReport = async (audit) => {
  if (audit.status !== 'completed') {
    console.warn('Cannot download report for incomplete audit');
    return false;
  }
  
  // Show loading indicator or notification
  const success = await downloadAuditReport(audit);
  
  // Show success or error notification
  return success;
};