import { supabase } from './supabase';
import { RedFlagDetector } from './red-flag-detector';

export interface AIResponse {
  response: string;
  error?: string;
  redFlagDetected?: boolean;
  severity?: 'high' | 'medium' | 'low';
  category?: string;
}

export class AIService {
  private static async callEdgeFunction(functionName: string, payload: any): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error);
      return { 
        response: '', 
        error: error.message || 'An error occurred while processing your request.' 
      };
    }
  }

  private static async checkForRedFlags(text: string, questionId: string, source: 'asker' | 'partner'): Promise<boolean> {
    try {
      // First, do client-side detection for immediate response
      const clientResult = RedFlagDetector.detectRedFlags(text);
      
      if (clientResult.isRedFlag) {
        // Call server-side function to log the red flag
        await supabase.functions.invoke('check-red-flags', {
          body: {
            text,
            questionId,
            userId: (await supabase.auth.getUser()).data.user?.id,
            source
          }
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking red flags:', error);
      return false;
    }
  }

  static async clarifyIntent(questionText: string, userId: string, messages: any[] = []): Promise<AIResponse> {
    // Check for red flags in the question
    const redFlagDetected = await this.checkForRedFlags(questionText, 'temp-question-id', 'asker');
    
    if (redFlagDetected) {
      const redFlagResult = RedFlagDetector.detectRedFlags(questionText);
      return {
        response: '',
        redFlagDetected: true,
        severity: redFlagResult.severity,
        category: redFlagResult.category,
        error: 'Red flag detected - conversation halted for safety'
      };
    }

    return this.callEdgeFunction('clarify-intent', {
      questionText,
      userId,
      messages
    });
  }

  static async startPartnerReflection(questionId: string, partnerId: string): Promise<AIResponse> {
    return this.callEdgeFunction('partner-reflection', {
      questionId,
      partnerId,
      messages: []
    });
  }

  static async continuePartnerReflection(questionId: string, partnerId: string, messages: any[], userMessage: string): Promise<AIResponse> {
    // Check for red flags in partner's message
    const redFlagDetected = await this.checkForRedFlags(userMessage, questionId, 'partner');
    
    if (redFlagDetected) {
      const redFlagResult = RedFlagDetector.detectRedFlags(userMessage);
      return {
        response: '',
        redFlagDetected: true,
        severity: redFlagResult.severity,
        category: redFlagResult.category,
        error: 'Red flag detected - conversation halted for safety'
      };
    }

    return this.callEdgeFunction('partner-reflection', {
      questionId,
      partnerId,
      messages
    });
  }

  static async generateInsights(questionId: string): Promise<any> {
    return this.callEdgeFunction('generate-insights', {
      questionId
    });
  }
}