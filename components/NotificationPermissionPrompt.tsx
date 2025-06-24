import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import { NotificationService } from '@/lib/notifications';
import * as Notifications from 'expo-notifications';

interface NotificationPermissionPromptProps {
  visible: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

export function NotificationPermissionPrompt({ 
  visible, 
  onClose, 
  onPermissionGranted 
}: NotificationPermissionPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const token = await NotificationService.registerForPushNotifications();
      
      if (token) {
        onPermissionGranted?.();
        onClose();
      } else {
        // Permission denied or failed
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666666" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Bell size={48} color="#9A6BFF" />
          </View>

          <Text style={styles.title}>Stay Connected</Text>
          <Text style={styles.description}>
            Get notified when your partner responds or when insights are ready. 
            We'll only send meaningful updates about your relationship conversations.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Know when your partner shares something important</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Get notified when insights are ready</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Never miss a meaningful conversation</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.allowButton, isRequesting && styles.allowButtonDisabled]}
            onPress={handleRequestPermission}
            disabled={isRequesting}
          >
            <Text style={styles.allowButtonText}>
              {isRequesting ? 'Requesting...' : 'Allow Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefits: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  allowButton: {
    backgroundColor: '#9A6BFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButtonDisabled: {
    backgroundColor: '#B8A0FF',
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#999999',
    fontSize: 16,
    fontWeight: '500',
  },
});