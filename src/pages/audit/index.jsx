// src/pages/audit/index.jsx
import React, { useState } from 'react';
import useFetchAudits from './hooks/useFetchAudits';
import AuditFilters from './components/AuditFilters';
// import AuditSummary from './components/AuditSummary';
// import AuditCharts from './components/AuditCharts';
import AuditForm from './components/AuditForm';
import AuditList from './components/AuditList';
import AppAlert from '@/common/AppAlert';



const Audit = () => {
  const [showForm, setShowForm] = useState(true);
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


  // Get audit actions
  //   const { createAudit, updateAudit, deleteAudit } = useAuditActions();

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

  // Handle filter changes
  //   const handleFilterChange = (newFilters) => {
  //     setFilters(newFilters);
  //     // Reset to first page when filters change
  //     setPage(0);
  //   };

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
      <div className="page-header">
        <h1>Audit Management</h1>
      </div>

      <div className="dashboard-section">
        {/* Summary statistics */}
        {/* <AuditSummary audits={audits} /> */}

        {/* Charts and visualizations */}
        {/* <AuditCharts audits={audits} /> */}
      </div>

      <div className="filter-section">
        {/* Filters */}
        <AuditFilters
          onApplyFilters={handleApplyFilters}
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
        //   onUpdateAudit={handleUpdateAudit}
          
        //   filters={filters}
        //   onDeleteAudit={deleteAudit}
        />
      </div>
    </div>
  );
};

export default Audit;