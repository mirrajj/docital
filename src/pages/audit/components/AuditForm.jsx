import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/config/supabaseClient';
import useAuditActions from '../hooks/useAuditActions';

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Template Save Modal Component
const TemplateSaveModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Would you like to save these questions as a reusable template?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Template Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter template title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Template Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    scheduledDate: '',
    assignedTo: '',
    templateId: '',
    customQuestions: []
  });

  // Template loading states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateQuestions, setTemplateQuestions] = useState([]);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [departments, setDepartments] = useState([]);

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

      setFormData(prev => ({
        ...prev,
        customQuestions: formattedQuestions
      }));

      setIsCreatingCustom(true); // Show as custom questions
    } catch (error) {
      console.error('Exception when fetching audit questions:', error);
      setTemplateQuestions([]);
    }
  };

  // Load audit data if in edit mode
  useEffect(() => {
    if (isEditMode && audit) {

      setFormData({
        title: audit.audit_title || '',
        description: audit.description || '',
        departmentId: audit.department_id || '',
        scheduledDate: (audit.scheduled_date),
        assignedTo: audit.assigned_to || '',
        templateId: audit.template_id || '',
        customQuestions: [] // We'll load these separately
      });

      // If audit has a template, load the template details
      if (audit.template_id) {
        loadTemplateDetails(audit.template_id);
        setIsCreatingCustom(false);
      } else {
        // If no template, load the questions but keep them in read-only mode
        loadAuditQuestions(audit.audit_id);
        // Important: Even if using custom questions, don't allow editing them
        setIsCreatingCustom(false);  // Force template mode even for custom questions
      }
    }
  }, [audit, isEditMode]);

  // Function to load departments from Supabase
  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('department')
        .select('department_id, name')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
        return;
      }

      // Format department data
      const formattedDepartments = data.map(dept => ({
        id: dept.department_id,
        name: dept.name
      }));

      setDepartments(formattedDepartments || []);
    } catch (error) {
      console.error('Exception when fetching departments:', error);
      setDepartments([]);
    }
  };

  // Function to load employees from Supabase
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employee')
        .select('id, name, department')
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

  useEffect(() => {
    loadEmployees();
    loadTemplates();
    loadDepartments();
  }, []);

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

  // Handle select changes for shadcn/ui Select
  const handleSelectChange = (name, value) => {
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
  const handleTemplateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      templateId: value
    }));

    if (value) {
      loadTemplateDetails(value);
      setIsCreatingCustom(false);
    } else {
      setTemplateQuestions([]);
      setSelectedTemplate(null);
    }

    setIsDirty(true);
  };

  // Toggle custom template creation
  const toggleCustomTemplate = () => {
    // Don't allow switching to custom mode in edit mode
    if (isEditMode && !isCreatingCustom) {
      return; // Prevent toggling to custom in edit mode
    }

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
      question_text: '',
      question_type: 'yes_no',
      required: true,
      options: null,
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
    } else if (currentStep === 2) {
      // In edit mode with custom questions already, don't require a template
      const needsTemplateOrQuestions = !(isEditMode && audit && !audit.template_id);

      if (needsTemplateOrQuestions && !isCreatingCustom && !formData.templateId) {
        newErrors.templateId = 'Please select a template';
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
      <Card key={index} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Question {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCustomQuestion(index)}
              className="text-red-500 h-8"
            >
              Remove
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`question-${index}`}>
              Question Text
            </Label>
            <Input
              id={`question-${index}`}
              value={question.question_text}
              onChange={(e) => updateCustomQuestion(index, 'question_text', e.target.value)}
              className={errors[`question-${index}`] ? 'border-red-500' : ''}
            />
            {errors[`question-${index}`] && (
              <p className="text-xs text-red-500">{errors[`question-${index}`]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`question-type-${index}`}>
                Question Type
              </Label>
              <Select
                value={question.question_type}
                onValueChange={(value) => updateCustomQuestion(index, 'question_type', value)}
              >
                <SelectTrigger id={`question-type-${index}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Yes/No</SelectItem>
                  <SelectItem value="scale">Scale (1-5)</SelectItem>
                  <SelectItem value="text">Text Response</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`question-required-${index}`}>
                Required
              </Label>
              <Select
                value={question.required.toString()}
                onValueChange={(value) => updateCustomQuestion(index, 'required', value === 'true')}
              >
                <SelectTrigger id={`question-required-${index}`}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {question.question_type === 'multiple_choice' && (
            <div className="space-y-2">
              <Label htmlFor={`question-options-${index}`}>
                Options (comma separated)
              </Label>
              <Input
                id={`question-options-${index}`}
                placeholder="Option 1, Option 2, Option 3"
                value={question.options || ''}
                onChange={(e) => updateCustomQuestion(index, 'options', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Audit Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              <div className="space-y-2">
                <Label htmlFor="departmentId">
                  Department<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleSelectChange('departmentId', value)}
                >
                  <SelectTrigger id="departmentId" className={errors.departmentId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length > 0 ? (
                      departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled>No departments found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Scheduled Date<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className={errors.scheduledDate ? 'border-red-500' : ''}
                />
                {errors.scheduledDate && <p className="text-xs text-red-500">{errors.scheduledDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  Assigned To
                </Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => handleSelectChange('assignedTo', value)}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Tabs
              defaultValue={isCreatingCustom ? "custom" : "template"}
              onValueChange={(value) => {
                // Only allow changing to custom if not in edit mode
                if (!isEditMode || value !== "custom") {
                  setIsCreatingCustom(value === "custom");
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Use Template</TabsTrigger>
                <TabsTrigger value="custom" disabled={isEditMode}>
                  Create Custom {isEditMode && "(Disabled in Edit Mode)"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="templateId">
                    Select Template
                  </Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger id="templateId" className={errors.templateId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.templateId && <p className="text-xs text-red-500">{errors.templateId}</p>}
                </div>

                {selectedTemplate && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Template Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h4 className="text-sm font-medium mb-2">
                        {selectedTemplate.title}
                        <Badge variant="outline" className="ml-2">v{selectedTemplate.version}</Badge>
                      </h4>

                      {templateQuestions.length > 0 ? (
                        <div className="space-y-3">
                          {templateQuestions.map((question, index) => (
                            <div key={question.id} className="border-b border-gray-200 pb-2">
                              <p className="text-sm font-medium">
                                {index + 1}. {question.questionText} {question.required && '*'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Type: {question.questionType.replace('_', ' ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No questions found in this template.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 pt-4">
                {isEditMode ?
                  (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Creating custom questions is disabled when editing an existing audit.
                        You can select a different template, but cannot create new custom questions.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10">
                        <Label className="text-sm font-medium">Custom Questions</Label>
                        <Button
                          size="sm"
                          onClick={addCustomQuestion}
                        >
                          Add Question
                        </Button>
                      </div>

                      {formData.customQuestions.length > 0 ? (
                        <div className="space-y-4">
                          {renderCustomQuestionFields()}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                          <p className="text-sm text-gray-500 mb-4">No custom questions added yet.</p>
                          <Button onClick={addCustomQuestion} size="sm">
                            Add First Question
                          </Button>
                        </div>
                      )}

                      {errors.customQuestions && (
                        <p className="text-xs text-red-500">{errors.customQuestions}</p>
                      )}
                    </>
                  )
                }
              </TabsContent>
            </Tabs>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-base font-medium">Review Audit Details</h3>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Audit Title</h4>
                    <p>{formData.title}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Department</h4>
                    <p>
                      {departments.find(dept => dept.id.toString() === formData.departmentId)?.name || 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Scheduled Date</h4>
                    <p>{formData.scheduledDate}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Assigned To</h4>
                    <p>
                      {employees.find(emp => emp.id.toString() === formData.assignedTo)?.name || 'Not assigned'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-gray-500">Description</h4>
                    <p className="whitespace-pre-line">{formData.description || 'No description provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                {isCreatingCustom ? (
                  <div className="space-y-4">
                    {formData.customQuestions.length > 0 ? (
                      formData.customQuestions.map((question, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <p className="text-sm font-medium">
                            {index + 1}. {question.question_text} {question.required && <span className="text-red-500">*</span>}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="capitalize">Type: {question.question_type.replace('_', ' ')}</span>
                            {question.question_type === 'multiple_choice' && question.options && (
                              <span className="ml-4">Options: {question.options}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No custom questions added.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTemplate ? (
                      <div>
                        <div className="flex items-center mb-3">
                          <h3 className="text-sm font-medium">{selectedTemplate.title}</h3>
                          <Badge variant="outline" className="ml-2">v{selectedTemplate.version}</Badge>
                        </div>

                        {templateQuestions.length > 0 ? (
                          templateQuestions.map((question, index) => (
                            <div key={question.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                              <p className="text-sm font-medium">
                                {index + 1}. {question.questionText} {question.required && <span className="text-red-500">*</span>}
                              </p>
                              <p className="text-xs text-gray-500 capitalize mt-1">
                                Type: {question.questionType.replace('_', ' ')}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No questions in this template.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No template selected.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Audit' : 'Create New Audit'}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {isEditMode ? 'Update the audit details below.' : 'Fill out the details to create a new audit.'}
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === step
                      ? 'bg-blue-600 text-white'
                      : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {currentStep > step ? (
                      '✓'
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {step === 1 ? 'Basic Info' : step === 2 ? 'Questions' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="h-1 flex-1 bg-green-500"></div>
              <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={goToNextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Create Audit'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Discarding Changes */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />

      {/* Confirmation Modal for Submitting Form */}
      <ConfirmationModal
        isOpen={isSubmitConfirmModalOpen}
        title="Submit Audit"
        message={isEditMode ? "Are you sure you want to save these changes?" : "Are you sure you want to create this audit?"}
        onConfirm={confirmAndSubmitForm}
        onCancel={() => setIsSubmitConfirmModalOpen(false)}
        isLoading={isSubmitting}
      />

      {/* Template Save Modal */}
      <TemplateSaveModal
        isOpen={isTemplateSaveModalOpen}
        onClose={() => handleTemplateSaveDecision(false)}
        onSave={(title, description) => handleTemplateSaveDecision(true, title, description)}
      />
    </div>
  );
};

export default AuditForm;