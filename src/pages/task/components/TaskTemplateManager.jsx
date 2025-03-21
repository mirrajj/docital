import React, { useState, useEffect } from 'react';
import { useTaskTemplates } from '../hooks/useTaskTemplates';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AppAlert from '@/common/AppAlert';
import supabase from '@/config/supabaseClient';

const TaskTemplateManager = ({ onCancel }) => {
    const {
        templates,
        loading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        fetchTemplates,
    } = useTaskTemplates();

    const [activeTab, setActiveTab] = useState('templates');
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [showFieldDialog, setShowFieldDialog] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState(null);
    const [tempFields, setTempFields] = useState([]); // Temporary fields during creation
    const [expandedTemplate, setExpandedTemplate] = useState(null);
    const [showError, setShowError] = useState({ state: false, message: '' });
    const [showSuccess, setShowSuccess] = useState({ state: false, message: '' });
    const [creationStep, setCreationStep] = useState('basicDetails'); // 'basicDetails' or 'fieldCreation'


    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
    const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false);
    const [isAddingField, setIsAddingField] = useState(false);

    // Template form state
    const [templateForm, setTemplateForm] = useState({
        title: '',
        description: '',
        document_code: '',
        template_type: 'general',
        version: 1,
        is_latest: true,
        instructions: '',
        instructionsFile: null,
        fields: []
    });

    // Field form state
    const [fieldForm, setFieldForm] = useState({
        name: '',
        type: 'text',
        constraints: {}
    });

    // New option for select field constraints
    const [newOption, setNewOption] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Reset template form when editing template changes
    useEffect(() => {
        if (editingTemplate) {
            setTemplateForm({
                title: editingTemplate.title || '',
                description: editingTemplate.description || '',
                document_code: editingTemplate.document_code || '',
                template_type: editingTemplate.template_type || 'general',
                version: editingTemplate.version || 1,
                is_latest: editingTemplate.is_latest !== undefined ? editingTemplate.is_latest : true,
                instructions: editingTemplate.instructions || '',
                fields: editingTemplate.fields || []
            });
        } else {
            setTemplateForm({
                title: '',
                description: '',
                document_code: '',
                template_type: 'general',
                version: 1,
                is_latest: true,
                instructions: '',
                fields: []
            });
        }
    }, [editingTemplate]);

    // Reset field form when editing field changes
    useEffect(() => {
        if (editingFieldIndex !== null && expandedTemplate && expandedTemplate.fields[editingFieldIndex]) {
            const field = expandedTemplate.fields[editingFieldIndex];
            setFieldForm({
                name: field.name || '',
                type: field.type || 'text',
                constraints: field.constraints || {}
            });
        } else {
            setFieldForm({
                name: '',
                type: 'text',
                constraints: {}
            });
        }
    }, [editingFieldIndex, expandedTemplate]);

    const handleCreateTemplate = () => {
        setEditingTemplate(null);
        setShowTemplateDialog(true);
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            title: template.title,
            description: template.description,
            document_code: template.document_code,
            template_type: template.template_type,
            version: template.version,
            is_latest: template.is_latest,
            instructions: template.instructions,
            fields: template.fields
        });
        setTempFields(template.fields); // Load existing fields into tempFields
        setShowTemplateDialog(true);
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            setIsDeletingTemplate(true);
            await deleteTemplate(templateId);
            setShowSuccess({
                state: true,
                message: 'Template deleted successfully'
            });
        } catch (error) {
            setShowError({
                state: true,
                message: `Failed to delete template: ${error.message}`
            });
        } finally {
            isDeletingTemplate(false);
        }
    };

    const handleFinalizeTemplate = async () => {
        try {
            let instructionsUrl = templateForm.instructions; // Keep existing URL if no new file

            // If there's a new file to upload
            if (templateForm.instructionsFile) {
                setIsCreatingTemplate(true);

                // Generate a unique filename
                const timestamp = new Date().getTime();
                const fileExt = templateForm.instructionsFile.name.split('.').pop();
                const fileName = `${templateForm.document_code || 'template'}-${timestamp}.${fileExt}`;

                // Upload to Supabase storage
                const { data, error } = await supabase
                    .storage
                    .from('tasks-instructions')
                    .upload(`instructions/${fileName}`, templateForm.instructionsFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;

                // Get the public URL
                const { data: urlData } = supabase
                    .storage
                    .from('tasks-instructions')
                    .getPublicUrl(`instructions/${fileName}`);

                instructionsUrl = urlData.publicUrl;
            }

            const finalTemplate = {
                
                title: templateForm.title,
                description: templateForm.description,
                document_code: templateForm.document_code,
                template_type: templateForm.template_type,

                instructions: instructionsUrl, // Store the URL
                fields: tempFields,
                version: editingTemplate ? templateForm.version + 1 : 1,
                is_latest: true,
            };

            // Create a new version of the template
            await createTemplate(finalTemplate);

            // Mark the previous version as not latest
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, { is_latest: false });
            }

            setShowSuccess({
                state: true,
                message: 'Template updated successfully',
            });
            setShowTemplateDialog(false);
            setCreationStep('basicDetails');
            setTempFields([]);
        } catch (error) {
            console.log(error);
            setShowError({
                state: true,
                message: `Failed to ${editingTemplate ? 'update' : 'create'} template: ${error.message}`,
            });
        } finally {
            setIsCreatingTemplate(false);
        }
    };


    const handleEditTempField = (index) => {
        const field = tempFields[index];
        setFieldForm(field); // Load the field into the field form
        setEditingFieldIndex(index); // Track which field is being edited
        setShowFieldDialog(true); // Open the field dialog
    };

    const handleDeleteTempField = (index) => {
        const updatedFields = tempFields.filter((_, i) => i !== index);
        setTempFields(updatedFields); // Remove the field from tempFields
    };


    const handleFieldSubmit = () => {
        setIsAddingField(true);
        if (fieldForm.name.trim() === '') {
            setShowError({ state: true, message: 'Field name is required' });
            setIsAddingField(false);
            return;
        }

        if (editingFieldIndex !== null) {
            // Update the existing field
            const updatedFields = [...tempFields];
            updatedFields[editingFieldIndex] = fieldForm;
            setTempFields(updatedFields);
        } else {
            // Add a new field
            setTempFields([...tempFields, fieldForm]);
        }

        setFieldForm({ name: '', type: 'text', constraints: {} }); // Reset the field form
        setIsAddingField(false);
        setShowFieldDialog(false); // Close the dialog
        setEditingFieldIndex(null); // Reset editing state
    };

    const handleAddOption = () => {
        if (newOption.trim() !== '') {
            setFieldForm(prev => {
                const updatedConstraints = { ...prev.constraints };

                if (!updatedConstraints.allowed_values) {
                    updatedConstraints.allowed_values = [];
                }

                updatedConstraints.allowed_values = [...updatedConstraints.allowed_values, newOption.trim()];

                return {
                    ...prev,
                    constraints: updatedConstraints
                };
            });
            setNewOption('');
        }
    };

    const handleRemoveOption = (index) => {
        setFieldForm(prev => {
            const updatedConstraints = { ...prev.constraints };
            updatedConstraints.allowed_values = updatedConstraints.allowed_values.filter((_, i) => i !== index);
            return {
                ...prev,
                constraints: updatedConstraints
            };
        });
    };

    const handleTemplateExpand = (template) => {
        if (expandedTemplate && expandedTemplate.id === template.id) {
            setExpandedTemplate(null);
        } else {
            setExpandedTemplate(template);
        }
    };

    // Helper to render constraint fields based on field type
    const renderConstraintFields = () => {
        switch (fieldForm.type) {
            case 'text':
                return (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="min_length">Minimum Length</Label>
                            <Input
                                id="min_length"
                                type="number"
                                min="0"
                                value={fieldForm.constraints.min_length || ''}
                                onChange={(e) => setFieldForm({
                                    ...fieldForm,
                                    constraints: {
                                        ...fieldForm.constraints,
                                        min_length: e.target.value ? parseInt(e.target.value) : undefined
                                    }
                                })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="max_length">Maximum Length</Label>
                            <Input
                                id="max_length"
                                type="number"
                                min="0"
                                value={fieldForm.constraints.max_length || ''}
                                onChange={(e) => setFieldForm({
                                    ...fieldForm,
                                    constraints: {
                                        ...fieldForm.constraints,
                                        max_length: e.target.value ? parseInt(e.target.value) : undefined
                                    }
                                })}
                            />
                        </div>
                    </div>
                );
            case 'int':
            case 'decimal':
                return (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="min">Minimum Value</Label>
                            <Input
                                id="min"
                                type="number"
                                value={fieldForm.constraints.min || ''}
                                onChange={(e) => setFieldForm({
                                    ...fieldForm,
                                    constraints: {
                                        ...fieldForm.constraints,
                                        min: e.target.value ? parseFloat(e.target.value) : undefined
                                    }
                                })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="max">Maximum Value</Label>
                            <Input
                                id="max"
                                type="number"
                                value={fieldForm.constraints.max || ''}
                                onChange={(e) => setFieldForm({
                                    ...fieldForm,
                                    constraints: {
                                        ...fieldForm.constraints,
                                        max: e.target.value ? parseFloat(e.target.value) : undefined
                                    }
                                })}
                            />
                        </div>
                    </div>
                );
            case 'select':
            case 'multiselect':
                return (
                    <div className="col-span-2 space-y-2">
                        <Label>Allowed Values</Label>

                        <div className="flex gap-2">
                            <Input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                placeholder="Add new option"
                            />
                            <Button type="button" onClick={handleAddOption} variant="outline">
                                Add
                            </Button>
                        </div>

                        {fieldForm.constraints.allowed_values && fieldForm.constraints.allowed_values.length > 0 ? (
                            <div className="mt-2 space-y-2">
                                {fieldForm.constraints.allowed_values.map((option, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span>{option}</span>
                                        <Button
                                            onClick={() => handleRemoveOption(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 h-8 w-8 p-0"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No options added yet.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4">
            {showError.state && (
                <AppAlert
                    type="error"
                    message={showError.message}
                    onClose={() => setShowError({ state: false, message: '' })}
                />
            )}

            {showSuccess.state && (
                <AppAlert
                    type="success"
                    message={showSuccess.message}
                    onClose={() => setShowSuccess({ state: false, message: '' })}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-500">Task Template Manager</h1>
                <div className="flex items-center gap-2">

                    <Button className="flex items-center bg-transparent text-black border hover:bg-gray-100" onClick={() => { // Reset states when the dialog is closed
                        setTemplateForm({
                            title: '',
                            description: '',
                            document_code: '',
                            template_type: 'general',
                            version: 1,
                            is_latest: true,
                            instructions: '',
                            fields: []
                        });
                        setTempFields([]); // Reset tempFields
                        setCreationStep('basicDetails');
                        onCancel();
                    }

                    }>
                        <Minus size={16} /> Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate} className="flex items-center gap-2" disabled={loading}>
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Create Template
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                    {loading ? (
                        <div className="text-center py-10">Loading templates...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">Error: {error}</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No templates found. Create your first template to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {templates.map(template => (
                                <Card key={template.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle>{template.title}</CardTitle>
                                                    <Badge variant={template.is_latest ? "success" : "secondary"}>
                                                        v{template.version}
                                                    </Badge>
                                                    <Badge variant="outline">{template.template_type}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{template.document_code}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTemplate(template)}
                                                    className="text-blue-500"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                {/* <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </Button> */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTemplateExpand(template)}
                                                >
                                                    {expandedTemplate && expandedTemplate.id === template.id ? (
                                                        <ChevronDown size={16} />
                                                    ) : (
                                                        <ChevronRight size={16} />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {expandedTemplate && expandedTemplate.id === template.id && (
                                        <CardContent>
                                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                <h3 className="font-medium mb-2">Description</h3>
                                                <p className="text-gray-700">{template.description || 'No description provided.'}</p>

                                                {template.instructions && (
                                                    <>
                                                        <h3 className="font-medium mt-4 mb-2">Instructions</h3>
                                                        <p className="text-gray-700">{template.instructions}</p>
                                                    </>
                                                )}
                                            </div>

                                            {template.instructions && (
                                                <>
                                                    <h3 className="font-medium mt-4 mb-2">Instructions</h3>
                                                    <a
                                                        href={template.instructions}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        View Instructions Document
                                                    </a>
                                                </>
                                            )}


                                            {template.fields && template.fields.length > 0 ? (
                                                <div className="space-y-2">
                                                    {template.fields.map((field, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-white border rounded-md p-3 flex justify-between items-start"
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium">{field.name}</h4>
                                                                    {field.constraints?.required && (
                                                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                                                    )}
                                                                    <Badge variant="outline" className="text-xs capitalize">{field.type}</Badge>
                                                                </div>

                                                                {field.type === 'select' && field.constraints?.allowed_values && field.constraints.allowed_values.length > 0 && (
                                                                    <div className="mt-2 text-sm text-gray-500">
                                                                        Options: {field.constraints.allowed_values.join(', ')}
                                                                    </div>
                                                                )}

                                                                {(field.type === 'int' || field.type === 'decimal') && (field.constraints?.min !== undefined || field.constraints?.max !== undefined) && (
                                                                    <div className="mt-2 text-sm text-gray-500">
                                                                        Range: {field.constraints.min !== undefined ? field.constraints.min : 'Any'} to {field.constraints.max !== undefined ? field.constraints.max : 'Any'}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* <div className="flex items-center gap-1">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleEditField(index)}
                                                                    className="text-blue-500 h-8 w-8 p-0"
                                                                >
                                                                    <Edit size={14} />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleDeleteField(index)}
                                                                    className="text-red-500 h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div> */}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-gray-50 rounded-md">
                                                    <p className="text-gray-500">No fields defined for this template.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="documentation">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Template Documentation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Overview</h3>
                                <p>
                                    Task templates allow you to create reusable structures for common tasks. Each template can have multiple fields
                                    to collect specific information when tasks are created and completed.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Template Components</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Basic Information:</strong> Title, description, document code, and type.</li>
                                    <li><strong>Version Control:</strong> Templates maintain version history for compliance tracking.</li>
                                    <li><strong>Custom Fields:</strong> Define the data to be collected for each task created from the template.</li>
                                    <li><strong>Instructions:</strong> Provide guidance for users completing tasks based on this template.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Field Types</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Text:</strong> Single-line text input</li>
                                    <li><strong>Textarea:</strong> Multi-line text input for longer responses</li>
                                    <li><strong>Select:</strong> Dropdown with predefined options</li>
                                    <li><strong>Int:</strong> Integer input</li>
                                    <li><strong>Decimal:</strong> Numeric input with decimal values</li>
                                    <li><strong>Date:</strong> Date picker</li>
                                    <li><strong>Boolean:</strong> Yes/no field</li>
                                    <li><strong>File:</strong> File upload field</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Field Constraints</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Min/Max Values:</strong> For numeric fields</li>
                                    <li><strong>Min/Max Length:</strong> For text fields</li>
                                    <li><strong>Allowed Values:</strong> For select fields</li>
                                    <li><strong>Required:</strong> Whether the field must be filled</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog
                open={showTemplateDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset states when the dialog is closed
                        setTemplateForm({
                            title: '',
                            description: '',
                            document_code: '',
                            template_type: 'general',
                            version: 1,
                            is_latest: true,
                            instructions: '',
                            fields: []
                        });
                        setTempFields([]); // Reset tempFields
                        setCreationStep('basicDetails'); // Reset to the first step
                    }
                    setShowTemplateDialog(open);
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {creationStep === 'basicDetails' ? 'Create Template - Basic Details' : 'Create Template - Define Fields'}
                        </DialogTitle>
                    </DialogHeader>

                    {creationStep === 'basicDetails' ? (
                        // Step 1: Basic Details
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {/* Basic details form fields */}
                            <div className="col-span-2">
                                <Label htmlFor="title">Template Title *</Label>
                                <Input
                                    id="title"
                                    value={templateForm.title}
                                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                                    placeholder="Enter template title"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="description" className="mb-1">Description</Label>
                                <Textarea
                                    id="description"
                                    value={templateForm.description}
                                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                                    placeholder="Enter template description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="document_code" className="mb-1">Document Code</Label>
                                <Input
                                    id="document_code"
                                    value={templateForm.document_code}
                                    onChange={(e) => setTemplateForm({ ...templateForm, document_code: e.target.value })}
                                    placeholder="e.g. TASK-TEMP-001"
                                />
                            </div>

                            <div>
                                <Label htmlFor="template_type" className="mb-1">Template Type</Label>
                                <Select
                                    value={templateForm.template_type}
                                    onValueChange={(value) => setTemplateForm({ ...templateForm, template_type: value })}
                                >
                                    <SelectTrigger id="template_type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="checklist">Checklist</SelectItem>
                                        <SelectItem value="approval">Approval</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="version" className="mb-1">Version</Label>
                                <Input
                                    id="version"
                                    type="number"
                                    min="1"
                                    value={templateForm.version}
                                    onChange={(e) => setTemplateForm({ ...templateForm, version: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Label htmlFor="is_latest" className="mb-0">Latest Version</Label>
                                <Switch
                                    id="is_latest"
                                    checked={templateForm.is_latest}
                                    onCheckedChange={(checked) => setTemplateForm({ ...templateForm, is_latest: checked })}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="instructions" className="mb-1">Instructions File</Label>
                                <div className="space-y-2">
                                    <Input
                                        id="instructionsFile"
                                        type="file"
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                // Check file size (50MB = 50 * 1024 * 1024 bytes)
                                                if (file.size > 50 * 1024 * 1024) {
                                                    setShowError({
                                                        state: true,
                                                        message: 'File size exceeds the maximum limit of 50MB'
                                                    });
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setTemplateForm({ ...templateForm, instructionsFile: file });
                                            }
                                        }}
                                    />
                                    <p className="text-sm text-gray-500">Maximum file size: 50MB. Accepted formats: PDF, DOC, DOCX, TXT</p>
                                    {templateForm.instructions && (
                                        <div className="text-sm">
                                            <span className="font-medium">Current file: </span>
                                            <a href={templateForm.instructions} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                View Instructions
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Step 2: Field Creation
                        <div className="grid grid-cols-1 gap-4 py-4">
                            {/* Button to Add New Fields */}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFieldForm({ name: '', type: 'text', constraints: {} }); // Reset field form
                                        setShowFieldDialog(true); // Open the field dialog
                                    }}
                                >
                                    <Plus size={16} className="mr-2" /> Add Field
                                </Button>
                            </div>

                            {/* Render Temporary Fields */}
                            {tempFields.length > 0 ? (
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {tempFields.map((field, index) => (
                                        <div key={index} className="bg-white border rounded-md p-3 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{field.name}</h4>
                                                    <Badge variant="outline" className="text-xs capitalize">{field.type}</Badge>
                                                </div>
                                                {field.type === 'select' && field.constraints?.allowed_values && (
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Options: {field.constraints.allowed_values.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTempField(index)} // Edit temporary field
                                                    className="text-blue-500 h-8 w-8 p-0"
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTempField(index)} // Delete temporary field
                                                    className="text-red-500 h-8 w-8 p-0"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-md">
                                    <p className="text-gray-500">No fields added yet.</p>
                                </div>
                            )}
                        </div>

                    )}

                    <DialogFooter>
                        {creationStep === 'basicDetails' ? (
                            <Button onClick={() => setCreationStep('fieldCreation')}>Next</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setCreationStep('basicDetails')}>Back</Button>
                                <Button onClick={handleFinalizeTemplate} disabled={isCreatingTemplate}>
                                    {isCreatingTemplate ? (
                                        <>
                                            <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : "Finalize Template"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Field Dialog */}
            <Dialog
                open={showFieldDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setFieldForm({ name: '', type: 'text', constraints: {} }); // Reset field form
                        setEditingFieldIndex(null); // Reset editing state
                    }
                    setShowFieldDialog(open);
                }}
            >
                <DialogContent className="max-w-2xl ">
                    <DialogHeader>
                        <DialogTitle>{editingFieldIndex !== null ? 'Edit Field' : 'Add Field'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <Label htmlFor="field_name" className="mb-1">Field Name *</Label>
                            <Input
                                id="field_name"
                                value={fieldForm.name}
                                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                                placeholder="Enter field name"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="field_type" className="mb-1">Field Type</Label>
                            <Select
                                value={fieldForm.type}
                                onValueChange={(value) => setFieldForm({
                                    ...fieldForm,
                                    type: value,
                                    // Reset constraints when changing types
                                    constraints: value === fieldForm.type ? fieldForm.constraints : {}
                                })}
                            >
                                <SelectTrigger id="field_type">
                                    <SelectValue placeholder="Select field type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Text Fields
                                        </SelectLabel>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="textarea">Paragraph</SelectItem>
                                        <SelectItem value="select">Dropdown of options</SelectItem>
                                        <SelectItem value="multiselect">Multi-select</SelectItem>
                                        <SelectItem value="int">Integer e.g 1,2,3 </SelectItem>
                                        <SelectItem value="decimal">Decimal e.g 3.4, 45.5 ,0.4</SelectItem>
                                        <SelectItem value="date">Date and Time</SelectItem>
                                        <SelectItem value="phone number">Phone Number</SelectItem>
                                        <SelectItem value="boolean">Yes/No</SelectItem>
                                        <SelectItem value="file">File</SelectItem>
                                        <SelectItem value="products">Products</SelectItem>
                                        <SelectItem value="batch number">Batch Number</SelectItem>
                                        <SelectItem value="employee">Employees</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 col-span-2">
                            <Label htmlFor="required" className="mb-0">Required Field</Label>
                            <Switch
                                id="required"
                                checked={fieldForm.constraints?.required || false}
                                onCheckedChange={(checked) => setFieldForm({
                                    ...fieldForm,
                                    constraints: {
                                        ...fieldForm.constraints,
                                        required: checked
                                    }
                                })}
                            />
                        </div>


                        {renderConstraintFields()}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFieldDialog(false)}>Cancel</Button>
                        <Button onClick={handleFieldSubmit} disabled={isAddingField}>
                            {isAddingField ? (
                                <>
                                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {editingFieldIndex !== null ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (editingFieldIndex !== null ? 'Update Field' : 'Add Field')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskTemplateManager;