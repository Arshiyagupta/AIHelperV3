import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  type: 'new_question' | 'insights_ready' | 'partner_response';
  questionId?: string;
  partnerName?: string;
  message?: string;
}

export class NotificationService {
  private static pushToken: string | null = null;

  /**
   * Register for push notifications and store token
   */
  static async registerForPushNotifications(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }

    let token: string | null = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        this.pushToken = token;
        await this.savePushToken(token);
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9A6BFF',
      });
    }

    return token;
  }

  /**
   * Save push token to database
   */
  private static async savePushToken(token: string): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.data.user.id,
          device_token: token,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,device_token'
        });

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Remove push token from database (on logout)
   */
  static async removePushToken(): Promise<void> {
    if (!this.pushToken) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', user.data.user.id)
        .eq('device_token', this.pushToken);

      if (error) {
        console.error('Error removing push token:', error);
      }
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  }

  /**
   * Send notification to specific user
   */
  static async sendNotificationToUser(
    userId: string, 
    title: string, 
    body: string, 
    data?: NotificationData
  ): Promise<void> {
    try {
      const { data: tokens, error } = await supabase
        .from('push_tokens')
        .select('device_token')
        .eq('user_id', userId);

      if (error || !tokens?.length) {
        console.log('No push tokens found for user:', userId);
        return;
      }

      // Call edge function to send notifications
      const { error: sendError } = await supabase.functions.invoke('send-notification', {
        body: {
          tokens: tokens.map(t => t.device_token),
          title,
          body,
          data: data || {}
        }
      });

      if (sendError) {
        console.error('Error sending notification:', sendError);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Handle notification received while app is running
   */
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Schedule local notification (for testing or offline scenarios)
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    seconds: number = 0
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: seconds > 0 ? { seconds } : null,
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification permissions status
   */
  static async getPermissionsAsync(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }
}

// Notification templates
export const NotificationTemplates = {
  newQuestion: (partnerName: string) => ({
    title: `${partnerName} asked about you`,
    body: 'They want to understand you better. Tap to respond.',
    data: { type: 'new_question' as const }
  }),

  insightsReady: (partnerName: string) => ({
    title: 'Insights ready',
    body: `Your conversation with ${partnerName} has been analyzed. Tap to see insights.`,
    data: { type: 'insights_ready' as const }
  }),

  partnerResponse: (partnerName: string) => ({
    title: `${partnerName} responded`,
    body: 'They shared something important with you.',
    data: { type: 'partner_response' as const }
  }),

  reminderToConnect: () => ({
    title: 'Connect with your partner',
    body: 'Share your invite code to start understanding each other better.',
    data: { type: 'partner_response' as const }
  })
};