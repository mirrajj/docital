import { CSVLink } from "react-csv";

export const prepareCSVData = (audits) => {
  // Define headers for CSV
  const headers = [
    { label: "Audit Type", key: "audit_type" },
    { label: "Conducted By", key: "conducted_by" },
    { label: "Department", key: "department" },
    { label: "Scheduled Date", key: "scheduled_date" },
    { label: "Completion Date", key: "completion_date" },
    { label: "Status", key: "status" },
    { label: "Compliance Score", key: "compliance_score" }
  ];
  
  // Format data for CSV
  const csvData = audits.map(item => ({
    audit_type: item.audit_type,
    conducted_by: item.conducted_by,
    department: item.department.name,
    scheduled_date: item.scheduled_date,
    completion_date: item.completed_at,
    status: item.status,
    compliance_score: item.compliance_score
  }));
  
  return { headers, csvData };
};

