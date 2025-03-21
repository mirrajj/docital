import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';

const TaskSwitch = ({ itemID, item, updateTaskStatus, setShowError, setShowSuccess }) => {
    
    const [isActive, setIsActive] = useState(item.active);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggle = async (checked) => {
        setIsProcessing(true);
        try {
            await updateTaskStatus(itemID, checked);
            setIsActive(checked);
            setShowSuccess({
                state: true,
                message: `Task ${checked ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            // Revert the visual state on error
            setIsActive(!checked);
            setShowError({
                state: true,
                message: `Failed to update task status: ${error.message}`
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id={`switch-${itemID}`}
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isProcessing}
                className={isProcessing ? 'opacity-50' : ''}
                size={16}
            />
            <label 
                htmlFor={`switch-${itemID}`}
                className="text-xs font-medium cursor-pointer select-none"
            >
                {isActive ? 'Active' : 'Inactive'}
            </label>
        </div>
    );
};

export default TaskSwitch;