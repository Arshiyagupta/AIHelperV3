import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { AIService } from '@/lib/ai-service';
import { getQuestion, getUserProfile } from '@/lib/supabase';

export default function WaitingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { questionId } = useLocalSearchParams();
  const [partnerName, setPartnerName] = useState('your partner');
  const [status, setStatus] = useState('Connecting with your partner...');

  useEffect(() => {
    if (user && questionId) {
      initializePartnerEngagement();
    }
  }, [user, questionId]);

  const initializePartnerEngagement = async () => {
    try {
      // Get question details
      const question = await getQuestion(questionId as string);
      
      // Get partner name
      const partnerProfile = await getUserProfile(question.partner_id);
      setPartnerName(partnerProfile.full_name || 'your partner');

      setStatus(`Talking with ${partnerProfile.full_name || 'your partner'}...`);

      // Start partner reflection
      const response = await AIService.startPartnerReflection(
        questionId as string,
        question.partner_id
      );

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      // Simulate partner conversation (in real app, this would be handled by notifications)
      setTimeout(() => {
        setStatus('Generating insights...');
        generateInsights();
      }, 5000);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start partner engagement');
    }
  };

  const generateInsights = async () => {
    try {
      const insights = await AIService.generateInsights(questionId as string);
      
      if (insights.error) {
        Alert.alert('Error', insights.error);
        return;
      }

      // Navigate to insights screen
      router.push({
        pathname: '/insights',
        params: { 
          questionId,
          partnerName 
        }
      });

    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate insights');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageCircle size={64} color="#9A6BFF" />
        </View>
        
        <Text style={styles.title}>{status}</Text>
        <Text style={styles.subtitle}>
          SafeTalk AI is having a gentle conversation with {partnerName} to understand their perspective.
        </Text>
        <Text style={styles.note}>
          This usually takes a few minutes...
        </Text>

        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  note: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9A6BFF',
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
  },
});