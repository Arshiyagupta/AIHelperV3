import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService, NotificationData } from '@/lib/notifications';
import { useAuth } from './useAuth';

export function useNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (user) {
      // Register for push notifications
      NotificationService.registerForPushNotifications();

      // Listen for notifications received while app is running
      notificationListener.current = NotificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
          // You can show in-app notification here if needed
        }
      );

      // Listen for notification responses (when user taps notification)
      responseListener.current = NotificationService.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as NotificationData;
          handleNotificationResponse(data);
        }
      );
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const handleNotificationResponse = (data: NotificationData) => {
    switch (data.type) {
      case 'new_question':
        if (data.questionId) {
          router.push({
            pathname: '/clarify',
            params: { questionId: data.questionId }
          });
        }
        break;

      case 'insights_ready':
        if (data.questionId) {
          router.push({
            pathname: '/insights',
            params: { 
              questionId: data.questionId,
              partnerName: data.partnerName || 'Partner'
            }
          });
        }
        break;

      case 'partner_response':
        router.push('/(tabs)');
        break;

      default:
        router.push('/(tabs)');
    }
  };

  return {
    registerForNotifications: NotificationService.registerForPushNotifications,
    sendNotification: NotificationService.sendNotificationToUser,
    scheduleLocalNotification: NotificationService.scheduleLocalNotification,
  };
}