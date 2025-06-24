import { supabase } from './supabase';
import { Database } from '@/types/database';
import { NotificationService, NotificationTemplates } from './notifications';

type Question = Database['public']['Tables']['questions']['Row'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type Insight = Database['public']['Tables']['insights']['Row'];

export const createQuestion = async (questionText: string, partnerId: string): Promise<Question> => {
  const currentUser = await supabase.auth.getUser();
  if (!currentUser.data.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('questions')
    .insert({
      asker_id: currentUser.data.user.id,
      partner_id: partnerId,
      question_text: questionText,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification to partner about new question
  try {
    const { data: askerProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', currentUser.data.user.id)
      .single();

    const notification = NotificationTemplates.newQuestion(askerProfile?.full_name || 'Your partner');
    
    await NotificationService.sendNotificationToUser(
      partnerId,
      notification.title,
      notification.body,
      {
        ...notification.data,
        questionId: data.id,
        partnerName: askerProfile?.full_name
      }
    );
  } catch (notificationError) {
    console.error('Failed to send notification:', notificationError);
    // Don't throw - question creation should succeed even if notification fails
  }

  return data;
};

export const getQuestion = async (questionId: string): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error) throw error;
  return data;
};

export const updateQuestionStatus = async (questionId: string, status: Question['status']) => {
  const { error } = await supabase
    .from('questions')
    .update({ status })
    .eq('id', questionId);

  if (error) throw error;

  // Send notification when insights are ready
  if (status === 'answered') {
    try {
      const { data: question } = await supabase
        .from('questions')
        .select(`
          asker_id,
          users!questions_partner_id_fkey(full_name)
        `)
        .eq('id', questionId)
        .single();

      if (question) {
        const notification = NotificationTemplates.insightsReady(
          question.users?.full_name || 'Your partner'
        );
        
        await NotificationService.sendNotificationToUser(
          question.asker_id,
          notification.title,
          notification.body,
          {
            ...notification.data,
            questionId,
            partnerName: question.users?.full_name
          }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send insights ready notification:', notificationError);
    }
  }
};

export const getInsights = async (questionId: string): Promise<Insight | null> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('question_id', questionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};

export const getUserQuestions = async (userId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .or(`asker_id.eq.${userId},partner_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};