// src/pages/audit/components/AuditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/config/supabaseClient';
import useAuditActions from '../hooks/useAuditActions';
import TemplateSaveModal from './TemplateSaveModal';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Backdrop with blur effect */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
        </div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditForm = ({ audit = null, onSubmit, onCancel, setShowSuccess, setShowError }) => {
  const { createAudit, updateAudit, loading, error } = useAuditActions(setShowSuccess, setShowError);

  const [isTemplateSaveModalOpen, setIsTemplateSaveModalOpen] = useState(false);
  const [pendingAuditData, setPendingAuditData] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);

  const navigate = useNavigate();
  const isEditMode = !!audit;

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    // status: 'pending',
    scheduledDate: '',
    // dueDate: '',
    assignedTo: '',
    templateId: '',
    customQuestions: []
  });

  // Template loading states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateQuestions, setTemplateQuestions] = useState([]);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  const loadAuditQuestions = async (auditId) => {
    try {
      const { data: questions, error } = await supabase
        .from('audit_questions')
        .select('id, question_text, question_type, required, options, order')
        .eq('audit_id', auditId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching audit questions:', error);
        setTemplateQuestions([]);
        return;
      }

      // Transform data to match expected format
      const formattedQuestions = questions.map(question => ({
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        required: question.required,
        options: question.options,
        order: question.order
      }));

      // setTemplateQuestions(formattedQuestions);

      setFormData(prev => ({
        ...prev,
        customQuestions : formattedQuestions
      }))

      setIsCreatingCustom(true); // Show as custom questions
    } catch (error) {
      console.error('Exception when fetching audit questions:', error);
      setTemplateQuestions([]);
    }
  };
  // Load audit data if in edit mode
  useEffect(() => {
    if (isEditMode && audit) {
      // Format dates for form inputs
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      setFormData({
        title: audit.audit_title || '',
        description: audit.description || '',
        departmentId: audit.department_id || '',
        // status: audit.status || 'pending',
        scheduledDate: formatDate(audit.scheduled_date),
        // dueDate: formatDate(audit.dueDate),
        assignedTo: audit.assigned_to || '',
        templateId: audit.template_id || '',
        customQuestions: [] // We'll load these separately
      });

      // If audit has a template, load the template details
      if (audit.template_id) {
        loadTemplateDetails(audit.template_id);
        setIsCreatingCustom(false);
      } else {
        // If no template, check if it has questions directly
        loadAuditQuestions(audit.audit_id);
      }
    }
  }, [audit, isEditMode]);


  // Function to load departments from Supabase
  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('department')
        .select('department_id, name') // Assuming your department table has id and name columns
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
        return;
      }

      setDepartments(data || []);
    } catch (error) {
      console.error('Exception when fetching departments:', error);
      setDepartments([]);
    }
  };

  // Function to load employees from Supabase
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employee') // Adjust table name if different
        .select('id, name, department') // Adjust fields as needed
        .order('name');

      if (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
        return;
      }

      // Format employee names for display in dropdown
      const formattedEmployees = data.map(emp => ({
        id: emp.id,
        name: `${emp.name}`,
        departmentId: emp.department
      }));

      setEmployees(formattedEmployees || []);
    } catch (error) {
      console.error('Exception when fetching employees:', error);
      setEmployees([]);
    }
  };
  // Function to load all templates from Supabase
  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_templates')
        .select('id, title, description, version_number, created_at')
        .eq('is_latest_version', true); // Only get the latest version of each template

      if (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
        return;
      }

      // Transform data to match your component's expected format
      const formattedTemplates = data.map(template => ({
        id: template.id,
        title: template.title,
        version: template.version_number
        // You can add other properties as needed
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Exception when fetching templates:', error);
      setTemplates([]);
    }
  };

  // Function to load template details from Supabase
  const loadTemplateDetails = async (templateId) => {
    try {
      // First, find the selected template in the existing templates array
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template);

      // Fetch the questions associated with this template
      const { data: questions, error } = await supabase
        .from('audit_questions')
        .select('id, template_id, question_text, question_type, required, options, order')
        .eq('template_id', templateId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching template questions:', error);
        setTemplateQuestions([]);
        return;
      }

      // Transform data to match your component's expected format
      const formattedQuestions = questions.map(question => ({
        id: question.id,
        templateId: question.template_id,
        questionText: question.question_text,
        questionType: question.question_type,
        required: question.required,
        options: question.options, // This is already in jsonb format
        order: question.order
      }));

      setTemplateQuestions(formattedQuestions);
    } catch (error) {
      console.error('Exception when fetching template questions:', error);
      setTemplateQuestions([]);
    }
  };

  // Load department-specific templates when department changes
  useEffect(() => {
    loadDepartments();
    loadEmployees();
    loadTemplates();
  }, []);
  // console.log(templateQuestions);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setFormData(prev => ({
      ...prev,
      templateId
    }));

    if (templateId) {
      loadTemplateDetails(templateId);
      setIsCreatingCustom(false);
    } else {
      setTemplateQuestions([]);
      setSelectedTemplate(null);
    }

    setIsDirty(true);
  };

  // Toggle custom template creation
  const toggleCustomTemplate = () => {
    setIsCreatingCustom(!isCreatingCustom);
    if (!isCreatingCustom) {
      // Reset template selection
      setFormData(prev => ({
        ...prev,
        templateId: ''
      }));
      setTemplateQuestions([]);
      setSelectedTemplate(null);
    }
  };

  // Add a custom question
  const addCustomQuestion = () => {
    const newQuestion = {
      question_text: '', // Changed from questionText
      question_type: 'yes_no', // Changed from questionType
      required: true,
      options: null, // Added to match your schema
      order: formData.customQuestions.length + 1
    };

    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, newQuestion]
    }));

    setIsDirty(true);
  };

  // Update a custom question
  const updateCustomQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.customQuestions];
    updatedQuestions[index][field] = value;

    setFormData(prev => ({
      ...prev,
      customQuestions: updatedQuestions
    }));

    setIsDirty(true);
  };

  // Remove a custom question
  const removeCustomQuestion = (index) => {
    const updatedQuestions = formData.customQuestions.filter((_, i) => i !== index);

    // Reorder remaining questions
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1;
    });

    setFormData(prev => ({
      ...prev,
      customQuestions: updatedQuestions
    }));

    setIsDirty(true);
  };

  // Validate the current step
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.departmentId) newErrors.departmentId = 'Department is required';
      if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
      //   if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
      //   if (formData.scheduledDate && formData.dueDate && 
      //       new Date(formData.scheduledDate) > new Date(formData.dueDate)) {
      //     newErrors.dueDate = 'Due date must be after scheduled date';
      //   }
    } else if (currentStep === 2) {
      if (!isCreatingCustom && !formData.templateId) {
        newErrors.templateId = 'Please select a template or create custom questions';
      }

      if (isCreatingCustom && formData.customQuestions.length === 0) {
        newErrors.customQuestions = 'Please add at least one question';
      }

      // Validate each custom question if creating custom
      if (isCreatingCustom) {
        formData.customQuestions.forEach((q, index) => {
          if (!q.question_text.trim()) {
            newErrors[`question-${index}`] = 'Question text is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const goToNextStep = (e) => {
    if (e) e.preventDefault();
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Move to previous step
  const goToPrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    console.log("about to confirm submission");
    e.preventDefault();

    if (validateStep()) {
      // Show confirmation modal instead of submitting directly
      setIsSubmitConfirmModalOpen(true);
    }
  };

  // Handle form submission
  const confirmAndSubmitForm = async () => {
    setIsSubmitting(true);

    // Prepare the data
    const submitData = {
      id: isEditMode ? audit.audit_id : undefined, // Include ID for updates
      title: formData.title,
      description: formData.description,
      departmentId: formData.departmentId,
      scheduledDate: formData.scheduledDate,
      assignedTo: formData.assignedTo,
      templateId: formData.templateId || null,
      templateVersion: selectedTemplate?.version_number || 1,
      customQuestions: formData.customQuestions,
    };

    let result;

    // If creating custom questions without a template
    if (isCreatingCustom && formData.customQuestions.length > 0 && !formData.templateId) {
      setIsSubmitConfirmModalOpen(false);

      if (isEditMode) {
        // For edits, don't ask about template saving
        result = await updateAudit(submitData);
      } else {
        // For new audits, ask about template saving
        setPendingAuditData(submitData);
        setIsTemplateSaveModalOpen(true);
        setIsSubmitting(false);
        return;
      }
    } else {
      // No custom questions or already using a template
      result = isEditMode
        ? await updateAudit(submitData)
        : await createAudit(submitData);
    }

    setIsSubmitConfirmModalOpen(false);
    setIsSubmitting(false);

    if (result.success) {
      setIsDirty(false);
      setShowSuccess({ state: true, message: isEditMode ? "Audit updated successfully!" : "Audit created successfully!" });
      onSubmit();
    } else {
      setShowError({ state: true, message: result.error || "Failed to process audit" });
    }
  };

  const handleTemplateSaveDecision = async (saveAsTemplate, templateTitle = '', templateDescription = '') => {
    setIsTemplateSaveModalOpen(false);
    setIsSubmitting(true);

    if (pendingAuditData) {
      const result = await createAudit(pendingAuditData, saveAsTemplate, templateTitle, templateDescription);

      setIsSubmitting(false);

      if (result.success) {
        setIsDirty(false);
        onSubmit();
      }

      // Clear pending data
      setPendingAuditData(null);
    } else {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with confirmation if form is dirty
  const handleCancel = () => {
    if (isDirty) {
      setIsConfirmModalOpen(true);
    } else {
      onCancel();
    }
  };

  // Confirm discard changes
  const confirmDiscard = () => {
    setIsConfirmModalOpen(false);
    onCancel();
  };

  // Cancel discard changes
  const cancelDiscard = () => {
    setIsConfirmModalOpen(false);
  };

  // Custom question rendering logic
  const renderCustomQuestionFields = () => {
    return formData.customQuestions.map((question, index) => (
      <div key={question.id} className="mb-4 p-3 border border-gray-300 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Question {index + 1}</h4>
          <button
            type="button"
            className="text-red-500 hover:text-red-700"
            onClick={() => removeCustomQuestion(index)}
          >
            Remove
          </button>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border ${errors[`question-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={question.question_text}
            onChange={(e) => updateCustomQuestion(index, 'question_text', e.target.value)}
          />
          {errors[`question-${index}`] && (
            <p className="mt-1 text-sm text-red-500">{errors[`question-${index}`]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={question.question_type}
              onChange={(e) => updateCustomQuestion(index, 'question_type', e.target.value)}
            >
              <option value="yes_no">Yes/No</option>
              <option value="scale">Scale (1-5)</option>
              <option value="text">Text Response</option>
              <option value="multiple_choice">Multiple Choice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={question.required.toString()}
              onChange={(e) => updateCustomQuestion(index, 'required', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {question.questionType === 'multiple_choice' && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (comma separated)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Option 1, Option 2, Option 3"
              value={question.options || ''}
              onChange={(e) => updateCustomQuestion(index, 'options', e.target.value)}
            />
          </div>
        )}
      </div>
    ));
  };

  // Additional code for the step-based form will be included in the main return JSX

  // Helper function to render form step indicators
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Basic Information' },
      { number: 2, title: 'Template & Questions' },
      { number: 3, title: 'Review & Create' }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step) => (
          <React.Fragment key={step.number}>
            <div className={`flex items-center ${currentStep === step.number ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center border-2 rounded-full ${currentStep === step.number ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                {step.number}
              </div>
              <div className="ml-2 text-sm font-medium">
                {step.title}
              </div>
            </div>
            {step.number < steps.length && (
              <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Helper function to render form buttons
  const renderFormButtons = () => {
    return (
      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={goToPrevStep}
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={(e) => goToNextStep(e)}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update Audit' : 'Create Audit'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit Audit' : 'Create New Audit'}</h2>
      <TemplateSaveModal isOpen={isTemplateSaveModalOpen}
        onClose={() => handleTemplateSaveDecision(false)}
        onSave={(title, description) => handleTemplateSaveDecision(true, title, description)} />

      {renderStepIndicator()}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Audit Title*
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Department*
                </label>
                <select
                  name="departmentId"
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.departmentId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                  ))}
                </select>
                {errors.departmentId && <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>}
              </div>

              {/* <div>
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                              </label>
                              <select
                                  name="status"
                                  id="status"
                                  value={formData.status}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                  <option value="pending">Pending</option>
                                  <option value="scheduled">Scheduled</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                              </select>
                          </div> */}

              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date*
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  id="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.scheduledDate && <p className="mt-1 text-sm text-red-500">{errors.scheduledDate}</p>}
              </div>

              {/* <div>
                              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Due Date*
                              </label>
                              <input
                                  type="date"
                                  name="dueDate"
                                  id="dueDate"
                                  value={formData.dueDate}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              />
                              {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
                          </div> */}

              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select User</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Template & Questions */}
        {currentStep === 2 && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Template or Create Custom Questions
              </label>

              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  className={`px-3 py-2 border rounded-md ${!isCreatingCustom ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'} hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700`}
                  onClick={() => setIsCreatingCustom(false)}
                >
                  Use Template
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 border rounded-md ${isCreatingCustom ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'} hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700`}
                  onClick={toggleCustomTemplate}
                >
                  Create Custom
                </button>
              </div>

              {!isCreatingCustom ? (
                <div>
                  <select
                    name="templateId"
                    id="templateId"
                    value={formData.templateId}
                    onChange={handleTemplateChange}
                    className={`w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select Template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                  {errors.templateId && <p className="mt-1 text-sm text-red-500">{errors.templateId}</p>}

                  {selectedTemplate && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Template Preview</h3>
                      <div className="border border-gray-300 rounded-md p-4">
                        <h4 className="font-medium mb-2">{selectedTemplate.title} (v{selectedTemplate.version})</h4>

                        {templateQuestions.length > 0 ? (
                          <div className="space-y-3">
                            {templateQuestions.map(question => (
                              <div key={question.id} className="border-b border-gray-200 pb-2">
                                <p className="font-medium">{question.questionText} {question.required && '*'}</p>
                                <p className="text-sm text-gray-500">Type: {question.questionType.replace('_', ' ')}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No questions found in this template.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Custom Questions</h3>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={addCustomQuestion}
                    >
                      Add Question
                    </button>
                  </div>

                  {formData.customQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {renderCustomQuestionFields()}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No custom questions added yet.</p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={addCustomQuestion}
                      >
                        Add First Question
                      </button>
                    </div>
                  )}

                  {errors.customQuestions && (
                    <p className="mt-1 text-sm text-red-500">{errors.customQuestions}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Audit Details</h3>

            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Audit Title</h4>
                  <p className="text-base">{formData.title}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p className="text-base">
                    {departments.find(dept => dept.department_id === formData.departmentId)?.name || 'Not selected'}
                  </p>
                </div>

                {/* <div>
                                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                  <p className="text-base capitalize">{formData.status.replace('_', ' ')}</p>
                              </div> */}

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Scheduled Date</h4>
                  <p className="text-base">{formData.scheduledDate}</p>
                </div>

                {/* <div>
                                  <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                                  <p className="text-base">{formData.dueDate}</p>
                              </div> */}

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                  <p className="text-base">
                    {employees.find(emp => emp.id === formData.assignedTo)?.name || 'Not assigned'}
                  </p>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="text-base">{formData.description || 'No description provided'}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Questions</h4>

              {isCreatingCustom ? (
                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="font-medium mb-2">Custom Questions</h5>

                  {formData.customQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {formData.customQuestions.map((question, index) => (
                        <div key={question.id} className="border-b border-gray-200 pb-2">
                          <p className="font-medium">
                            {index + 1}. {question.question_text} {question.required && '*'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {question.question_type.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No custom questions added.</p>
                  )}
                </div>
              ) : selectedTemplate ? (
                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="font-medium mb-2">
                    Template: {selectedTemplate.title} (v{selectedTemplate.version})
                  </h5>

                  {templateQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {templateQuestions.map((question, index) => (
                        <div key={question.id} className="border-b border-gray-200 pb-2">
                          <p className="font-medium">
                            {index + 1}. {question.questionText} {question.required && '*'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {question.questionType.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No questions found in this template.</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No template or custom questions selected.</p>
              )}
            </div>
          </div>
        )}

        {renderFormButtons()}
      </form>
      {/* Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSubmitConfirmModalOpen}
        title="Submit Audit"
        message="Are you sure you want to submit this audit? This action cannot be undone."
        onConfirm={confirmAndSubmitForm}
        onCancel={() => setIsSubmitConfirmModalOpen(false)}
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </div>
  );
};

export default AuditForm;