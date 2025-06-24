import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { useAuth } from '@/hooks/useAuth';
import { AIService } from '@/lib/ai-service';
import { updateQuestionStatus } from '@/lib/questions';

interface Message {
  id: number;
  text: string;
  isAI: boolean;
}

export default function ClarifyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { questionId, questionText } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  useEffect(() => {
    if (user && questionText) {
      startClarification();
    }
  }, [user, questionText]);

  const startClarification = async () => {
    if (!user || !questionText) return;

    setIsLoading(true);
    try {
      const response = await AIService.clarifyIntent(
        questionText as string, 
        user.id, 
        []
      );

      if (response.redFlagDetected) {
        // Navigate to safety screen
        router.push({
          pathname: '/safety',
          params: {
            severity: response.severity,
            category: response.category
          }
        });
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      setMessages([{
        id: 1,
        text: response.response,
        isAI: true
      }]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to start clarification');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: currentMessage,
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Prepare message history for AI
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.text
      }));

      const response = await AIService.clarifyIntent(
        questionText as string,
        user.id,
        messageHistory
      );

      if (response.redFlagDetected) {
        // Navigate to safety screen
        router.push({
          pathname: '/safety',
          params: {
            severity: response.severity,
            category: response.category
          }
        });
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        text: response.response,
        isAI: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationCount(prev => prev + 1);

      // After 3 exchanges, move to partner engagement
      if (conversationCount >= 2) {
        setTimeout(() => {
          moveToPartnerEngagement();
        }, 2000);
      }

    } catch (error: any) {
      Alert.alert('Error', 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const moveToPartnerEngagement = async () => {
    try {
      // Update question status to processing
      await updateQuestionStatus(questionId as string, 'processing');
      
      // Navigate to waiting screen
      router.push({
        pathname: '/waiting',
        params: { questionId }
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to proceed to next step');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Understanding Your Question</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <ChatMessage 
              key={message.id}
              message={message.text}
              isAI={message.isAI}
            />
          ))}
          {isLoading && (
            <ChatMessage 
              message="I'm thinking about what you shared..."
              isAI={true}
            />
          )}
        </ScrollView>

        <ChatInput
          value={currentMessage}
          onChangeText={setCurrentMessage}
          onSend={sendMessage}
          placeholder="Type your response..."
          disabled={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});