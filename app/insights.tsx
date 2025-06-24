import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Brain, Lightbulb, MessageCircle } from 'lucide-react-native';
import { getInsights } from '@/lib/questions';

interface InsightData {
  emotional_summary: string;
  contextual_summary: string;
  suggested_action: string;
}

export default function InsightsScreen() {
  const router = useRouter();
  const { questionId, partnerName } = useLocalSearchParams();
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (questionId) {
      loadInsights();
    }
  }, [questionId]);

  const loadInsights = async () => {
    try {
      const insightData = await getInsights(questionId as string);
      
      if (insightData) {
        setInsights({
          emotional_summary: insightData.emotional_summary,
          contextual_summary: insightData.contextual_summary,
          suggested_action: insightData.suggested_action
        });
      } else {
        // Fallback insights for demo
        setInsights({
          emotional_summary: `${partnerName} is feeling overwhelmed and unseen. They've been carrying a lot lately and feel like their efforts aren't being noticed.`,
          contextual_summary: "This feeling intensified after recent stressful events where they felt isolated and unsupported in conversations.",
          suggested_action: "A heartfelt message acknowledging their efforts would mean more than any grand gesture right now. They need to feel seen and appreciated."
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insightItems = insights ? [
    {
      icon: Heart,
      title: "Emotional Insight",
      content: insights.emotional_summary,
      color: "#FF6B6B"
    },
    {
      icon: Brain,
      title: "Contextual Understanding",
      content: insights.contextual_summary,
      color: "#9A6BFF"
    },
    {
      icon: Lightbulb,
      title: "What Would Help",
      content: insights.suggested_action,
      color: "#34D399"
    }
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Insights About {partnerName}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Based on our conversation with {partnerName}, here's what might help you understand them better:
        </Text>

        <View style={styles.insightsContainer}>
          {insightItems.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: `${insight.color}15` }]}>
                <insight.icon size={24} color={insight.color} />
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightContent}>{insight.content}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Want help taking action?</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color="#9A6BFF" />
              <Text style={styles.actionButtonText}>Write a Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={20} color="#9A6BFF" />
              <Text style={styles.actionButtonText}>Plan Something</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.reflectButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.reflectButtonText}>Just Reflect</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#999999',
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    lineHeight: 24,
    marginBottom: 24,
  },
  insightsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: '#F8F8F8',
    padding: 24,
    borderRadius: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  insightContent: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  actionSection: {
    paddingBottom: 32,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#9A6BFF',
    fontSize: 16,
    fontWeight: '500',
  },
  reflectButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  reflectButtonText: {
    color: '#999999',
    fontSize: 16,
    fontWeight: '500',
  },
});