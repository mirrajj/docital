import { useState } from 'react';
import supabase from '@/config/supabaseClient';

/**
 * Custom hook for audit CRUD operations with Supabase
 */

const useAuditActions = (setShowSuccess, setShowError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new audit in the database
   * @param {Object} auditData - The audit data to be created
   * @returns {Promise<Object>} - The created audit or error
   */

  // Function to create a template
  const createTemplate = async (title, description) => {
    setLoading(true);
    setError(null);

    try {
      const { data: template, error: templateError } = await supabase
        .from('audit_templates')
        .insert({
          title,
          description,
          version_number: 1,
          is_latest_version: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (templateError) throw templateError;

      setLoading(false);
      return { data: template, success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message, success: false };
    }
  };

  // Function to create audit questions for a template or audit
  const createQuestions = async (questions, auditId = null, templateId = null) => {
    setLoading(true);
    setError(null);

    try {
      if (!auditId && !templateId) {
        throw new Error('Either auditId or templateId must be provided');
      }

      const questionsToInsert = questions.map(question => ({
        audit_id: auditId,
        template_id: templateId,
        question_text: question.question_text,
        question_type: question.question_type,
        required: question.required,
        options: question.options,
        order: question.order
      }));

      const { data, error: questionsError } = await supabase
        .from('audit_questions')
        .insert(questionsToInsert)
        .select();

      if (questionsError) throw questionsError;

      setLoading(false);
      return { data, success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message, success: false };
    }
  };

  // Function to create an audit and optionally save questions as a template
  const createAudit = async (auditData, saveAsTemplate = false, templateTitle = '', templateDescription = '') => {
    setLoading(true);
    setError(null);

    try {
      let templateId = auditData.templateId;
      let templateVersion = auditData.templateVersion;

      // If user wants to save custom questions as a template
      if (saveAsTemplate && auditData.customQuestions?.length > 0) {
        // Create new template
        const result = await createTemplate(
          templateTitle || `${auditData.title} Template`,
          templateDescription || `Template created from ${auditData.title}`
        );

        if (result.success) {
          templateId = result.data.id;
          templateVersion = result.data.version_number;




        } else {
          throw new Error(`Failed to create template: ${result.error}`);
        }
      }
      console.log(auditData.customQuestions);

      // Format the audit data
      const formattedData = {
        audit_title: auditData.title,
        audit_type: auditData.auditType || 'internal',
        scheduled_date: auditData.scheduledDate,
        assigned_to: auditData.assignedTo,
        department_id: auditData.departmentId,
        description: auditData.description,
        template_id: templateId ? templateId : null,
        template_version: templateVersion,
        updated_at: new Date().toISOString(),
      };

      // Insert the audit
      const { data: audit, error } = await supabase
        .from('audit')
        .insert(formattedData)
        .select()
        .single();

      if (error) throw error;

      // Create template questions
      if (saveAsTemplate && auditData.customQuestions?.length > 0) {
        console.log("saving as template");
        const questionsResult = await createQuestions(
          auditData.customQuestions,
          null,
          templateId
        );

        if (!questionsResult.success) {
          throw new Error(`Failed to create template questions: ${questionsResult.error}`);
        }
      }

      // If there are custom questions but we didn't save as a template,
      // store them directly with the audit
      if (!saveAsTemplate && auditData.customQuestions && auditData.customQuestions.length > 0) {
        // console.log(customQuestions);
        const questionsToInsert = auditData.customQuestions.map(question => ({
          audit_id: audit.audit_id,
          question_text: question.question_text,
          question_type: question.question_type,
          required: question.required,
          options: question.options,
          order: question.order
        }));

        const { error: questionsError } = await supabase
          .from('audit_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      setLoading(false);
      setShowSuccess({ state: true, message: "Audit created successfully" });
      return { audit, success: true };

    } catch (err) {

      setError(err.message);
      setShowError({ state: true, message: err.message });
      setLoading(false);
      return { error: err.message, success: false };

    }
  };

  // You can add updateAudit and deleteAudit functions here later
  const updateAudit = async (auditData) => {
    setLoading(true);

    try {
      // 1. Update the audit record
      const { error: auditError } = await supabase
        .from('audit')
        .update({
          audit_title: auditData.title,
          description: auditData.description,
          department_id: auditData.departmentId,
          scheduled_date: auditData.scheduledDate,
          assigned_to: auditData.assignedTo,
          template_id: auditData.templateId || null,
          updated_at: new Date().toISOString(),
          // Update other fields as needed
        })
        .eq('audit_id', auditData.id);

      if (auditError) throw auditError;

      // 2. Handle questions
      if (auditData.customQuestions && auditData.customQuestions.length > 0) {
        // First delete existing questions for this audit
        const { error: deleteError } = await supabase
          .from('audit_questions')
          .delete()
          .eq('audit_id', auditData.id);

        if (deleteError) throw deleteError;

        // Then insert the updated questions
        const questionsToInsert = auditData.customQuestions.map((q, index) => ({
          audit_id: auditData.id,
          question_text: q.question_text,
          question_type: q.question_type,
          required: q.required,
          options: q.options,
          order: index + 1
        }));

        const { error: insertError } = await supabase
          .from('audit_questions')
          .insert(questionsToInsert);

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating audit:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createAudit,
    updateAudit,
    // deleteAudit,
    loading,
    error
  };
};

export default useAuditActions;