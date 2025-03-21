import React, { useState } from 'react';
import useFetchAudits from './hooks/useFetchAudits';
import AuditFilters from './components/AuditFilters';
import AuditForm from './components/AuditForm';
import AuditList from './components/AuditList';
import AppAlert from '@/common/AppAlert';

const Audit = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({});
  const [showSuccess, setShowSuccess] = useState({state: false, message : ""});
  const [showError, setShowError] = useState({state: false, message : ""});
  const {
    audits,
    loading,
    error,
    page,
    setPage,
    totalPages
  } = useFetchAudits(10, filters); // 10 items per page
 
  const [selectedAudit, setSelectedAudit] = useState(null);

  const handleAuditSuccess = () => {
    setShowForm(false);
    setSelectedAudit(null);
  }

  // Handle creating new audit
  const handleCreateAudit = (auditData) => {
    createAudit(auditData);
    setShowForm(false);
  };

  // Handle updating existing audit
  const handleUpdateAudit = (auditData) => {
    updateAudit(auditData);
    setSelectedAudit(null);
    setShowForm(false);
  };

  // Handle edit button click
  const handleEditAudit = (audit) => {
    setSelectedAudit(audit);
    setShowForm(true);
  };
 
  const handleApplyFilters = (filters) => {
    console.log("Apply filters");
    setFilters(filters);
  }

  return (
    <div className="container">
      {showError.state && (
        <AppAlert
          type="error"
          message={showError.message}
          onClose={() => setShowError(false)}
        />
      )}
      {showSuccess.state && (
        <AppAlert
          type="success"
          message={showSuccess.message}
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      {/* Removed page-header with Audit Management title */}
      
      <div className="filter-section">
        <AuditFilters
          onApplyFilters={handleApplyFilters}
          showForm={showForm}
          onNewAudit={() => {
            setSelectedAudit(null);
            setShowForm(true);
          }}
        />
      </div>
      
      {/* Form for creating/editing audits */}
      {showForm && (
        <div className="form-section">
          <AuditForm
            audit={selectedAudit}
            onSubmit={handleAuditSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedAudit(null);
            }}
            setShowError={setShowError}
            setShowSuccess={setShowSuccess}
          />
        </div>
      )}
      
      {/* List of audits */}
      <div className="list-section">
        <AuditList
          audits={audits}
          loading={loading}
          error={error}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          onEditAudit={handleEditAudit}
          setSelectedAudit={setSelectedAudit}
        />
      </div>
    </div>
  );
};

export default Audit;