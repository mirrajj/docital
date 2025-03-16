import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle } from 'lucide-react';
import useGetDepartments from '../hooks/useGetDepartments';
import useGetTemplateFields from '../hooks/useGetTemplateFields';
import useGetTasks from '../hooks/useGetTasks';

const TaskForm = ({ onSubmit, onCancel, task, templates }) => {
    const { departments, loading: loadingDepartments } = useGetDepartments();
    const { tasks, loading: loadingTasks } = useGetTasks();
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Initialize form state
    const [formData, setFormData] = useState({
        task_name: '',
        description: '',
        task_type: '',
        template_id: '',
        document_code: '',
        status: 'pending',
        frequency: 'once',
        priority: 'medium',
        deadline: new Date().toISOString(),
        active: true,
        department_id: '',
        skippable: false // New field for skippable feature
    });

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Fetch template fields when template is selected
    const { fields: templateFields, loading: loadingFields } = useGetTemplateFields(formData.template_id);

    // Populate form when editing a task
    useEffect(() => {
        if (task) {
            setFormData({
                task_name: task.task_name || '',
                description: task.description || '',
                task_type: task.task_type || '',
                template_id: task.template_id || '',
                document_code: task.document_code || '',
                status: task.status || 'pending',
                frequency: task.frequency || 'once',
                priority: task.priority || 'medium',
                deadline: task.deadline || new Date().toISOString(),
                active: task.active !== undefined ? task.active : true,
                department_id: task.department_id || '',
                skippable: task.skippable || false // Initialize skippable field
            });

            if (task.template_id) {
                const template = templates.find(t => t.id === task.template_id);
                setSelectedTemplate(template);
            }
        }
    }, [task, templates]);

    // Load template fields when template is selected
    useEffect(() => {
        if (formData.template_id) {
            const template = templates.find(t => t.id === formData.template_id);
            setSelectedTemplate(template);
        } else {
            setSelectedTemplate(null);
        }
    }, [formData.template_id, templates]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'template_id') {
            const template = templates.find(t => t.id === value);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    template_id: template.id,
                    document_code: template.document_code || '',
                    task_type: template.template_type || prev.task_type
                }));
            }
        }
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            deadline: date.toISOString()
        }));
    };

    const handleCancelConfirm = () => {
        setShowCancelModal(false);
        onCancel();
    };

    const handleSubmitConfirm = () => {
        setShowSubmitModal(false);
        onSubmit(formData);
    };

    const handleSubmitClick = (e) => {
        e.preventDefault();
        setShowSubmitModal(true);
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">{task ? 'Edit Task' : 'Create New Task'}</h2>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Template Selection */}
                            <div>
                                <Label htmlFor="template_id">Task Template</Label>
                                <Select
                                    name="template_id"
                                    value={formData.template_id}
                                    onValueChange={(value) => handleSelectChange('template_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates && templates.map(template => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.title} (v{template.version})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Task Name */}
                            <div>
                                <Label htmlFor="task_name">Task Name</Label>
                                <Input
                                    id="task_name"
                                    name="task_name"
                                    value={formData.task_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Department */}
                            <div>
                                <Label htmlFor="department_id">Department</Label>
                                <Select
                                    name="department_id"
                                    value={formData.department_id}
                                    onValueChange={(value) => handleSelectChange('department_id', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!loadingDepartments && departments && departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.department_id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Document Code */}
                            <div>
                                <Label htmlFor="document_code">Document Code</Label>
                                <Input
                                    id="document_code"
                                    name="document_code"
                                    value={formData.document_code}
                                    onChange={handleInputChange}
                                    disabled={!!selectedTemplate} // Disabled if from template
                                />
                            </div>

                            {/* Task Type */}
                            <div>
                                <Label htmlFor="task_type">Task Type</Label>
                                <Select
                                    name="task_type"
                                    value={formData.task_type}
                                    onValueChange={(value) => handleSelectChange('task_type', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select task type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">general</SelectItem>
                                        <SelectItem value="data_collection">data_collection</SelectItem>
                                        <SelectItem value="checklist">checklist</SelectItem>
                                        <SelectItem value="one_time">one time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    onValueChange={(value) => handleSelectChange('priority', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Frequency */}
                            <div>
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select
                                    name="frequency"
                                    value={formData.frequency}
                                    onValueChange={(value) => handleSelectChange('frequency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="once">Once</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Skippable Switch */}
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="skippable">Skippable</Label>
                                <Switch
                                    id="skippable"
                                    name="skippable"
                                    checked={formData.skippable}
                                    onCheckedChange={(checked) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            skippable: checked
                                        }));
                                    }}
                                />
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="active">Active</Label>
                                <Switch
                                    id="active"
                                    name="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            active: checked
                                        }));
                                    }} />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>

                        {/* Dynamic Template Fields */}
                        {selectedTemplate && templateFields.length > 0 && (
                            <div className="mt-6">
                                {/* Template Name */}
                                <h3 className="text-xl font-semibold mb-4">{selectedTemplate.name || selectedTemplate.title}</h3>

                                {/* Exercise Book Section */}
                                <div className="space-y-4 border-l-2 border-gray-300 pl-4">
                                    {templateFields.map((field, index) => (
                                        <div key={index} className="relative">
                                            {/* Dashed Line */}
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent border-l-2 border-dashed border-gray-300"></div>

                                            {/* Field/Question and Type */}
                                            <div className="ml-6">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{field.name || `Field ${index + 1}`}</span>
                                                    <span className="text-sm text-gray-500">({field.type})</span>
                                                </div>

                                                {/* Constraints (if any) */}
                                                {field.constraints && (
                                                    <div className="mt-1 text-sm text-gray-600">
                                                        {field.constraints.allowed_values && (
                                                            <p>
                                                                <span className="font-medium">Allowed Values:</span>{' '}
                                                                {field.constraints.allowed_values.join(', ')}
                                                            </p>
                                                        )}
                                                        {field.constraints.min !== undefined && (
                                                            <p>
                                                                <span className="font-medium">Min:</span> {field.constraints.min}
                                                            </p>
                                                        )}
                                                        {field.constraints.max !== undefined && (
                                                            <p>
                                                                <span className="font-medium">Max:</span> {field.constraints.max}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelClick}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmitClick}>
                        {task ? 'Update Task' : 'Create Task'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Cancel Confirmation Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Confirm Cancel
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel? All unsaved changes will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            No, Continue Editing
                        </Button>
                        <Button variant="destructive" onClick={handleCancelConfirm}>
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Submit Confirmation Modal */}
            <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm {task ? 'Update' : 'Creation'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {task ? 'update' : 'create'} this task?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitConfirm}>
                            {task ? 'Update Task' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskForm;