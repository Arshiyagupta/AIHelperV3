import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/supabase';
import { createQuestion } from '@/lib/questions';
import { RedFlagDetector } from '@/lib/red-flag-detector';

export default function AskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const examples = [
    "What should I do to make her feel special?",
    "Why is he pulling away from me?",
    "How can I better support him right now?",
    "What does she need from me emotionally?"
  ];

  const handleAsk = async () => {
    if (!question.trim() || !user) return;

    // Check for red flags before proceeding
    const redFlagResult = RedFlagDetector.detectRedFlags(question.trim());
    
    if (redFlagResult.isRedFlag) {
      router.push({
        pathname: '/safety',
        params: {
          severity: redFlagResult.severity,
          category: redFlagResult.category
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user profile to check if they have a partner
      const profile = await getUserProfile(user.id);
      
      if (!profile.partner_id) {
        Alert.alert(
          'No Partner Connected',
          'You need to connect with your partner first. Go to your profile to enter their invite code.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
        );
        return;
      }

      // Create the question in the database
      const newQuestion = await createQuestion(question.trim(), profile.partner_id);
      
      // Navigate to clarify screen with question ID
      router.push({
        pathname: '/clarify',
        params: { 
          questionId: newQuestion.id,
          questionText: question.trim()
        }
      });
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ask About Your Partner</Text>
          <Text style={styles.subtitle}>What would you like to understand better?</Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question here..."
            placeholderTextColor="#999999"
            multiline
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Example questions:</Text>
          {examples.map((example, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.exampleItem}
              onPress={() => setQuestion(example)}
              disabled={isLoading}
            >
              <Text style={styles.exampleText}>"{example}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.askButton, 
            (!question.trim() || isLoading) && styles.askButtonDisabled
          ]}
          onPress={handleAsk}
          disabled={!question.trim() || isLoading}
        >
          <Text style={styles.askButtonText}>
            {isLoading ? 'Submitting...' : 'Ask'}
          </Text>
          {!isLoading && <Send size={20} color="#FFFFFF" />}
        </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999999',
    lineHeight: 26,
  },
  inputSection: {
    marginBottom: 32,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#1A1A1A',
    minHeight: 120,
    lineHeight: 26,
  },
  examples: {
    gap: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
    marginBottom: 8,
  },
  exampleItem: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  exampleText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  askButton: {
    backgroundColor: '#9A6BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  askButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});