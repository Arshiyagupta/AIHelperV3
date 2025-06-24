import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircleQuestion, Clock, Heart, Bell } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/supabase';
import { getUserQuestions } from '@/lib/questions';
import { NotificationService } from '@/lib/notifications';
import { NotificationPermissionPrompt } from '@/components/NotificationPermissionPrompt';
import { Database } from '@/types/database';
import * as Notifications from 'expo-notifications';

type Question = Database['public']['Tables']['questions']['Row'];
type UserProfile = Database['public']['Tables']['users']['Row'];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      checkNotificationPermissions();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [userProfile, questions] = await Promise.all([
        getUserProfile(user.id),
        getUserQuestions(user.id)
      ]);

      setProfile(userProfile);
      setRecentQuestions(questions.slice(0, 3)); // Show only recent 3
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const permissions = await NotificationService.getPermissionsAsync();
      
      // Show prompt if permissions haven't been determined yet
      if (permissions.status === 'undetermined') {
        // Delay showing the prompt to let the user settle in
        setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: Question['status']) => {
    switch (status) {
      case 'answered': return '#34D399';
      case 'processing': return '#F59E0B';
      case 'red_flag': return '#EF4444';
      default: return '#9A6BFF';
    }
  };

  const getStatusText = (status: Question['status']) => {
    switch (status) {
      case 'answered': return 'Insights ready';
      case 'processing': return 'In progress';
      case 'red_flag': return 'Needs attention';
      default: return 'Pending';
    }
  };

  const partnerName = profile?.partner_id ? 'your partner' : null;
  const isConnected = !!profile?.partner_id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {profile?.full_name || 'there'}</Text>
          {isConnected ? (
            <View style={styles.connectionStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected to {partnerName}</Text>
            </View>
          ) : (
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statusText}>No partner connected</Text>
            </View>
          )}
        </View>

        <View style={styles.mainActions}>
          <TouchableOpacity 
            style={styles.primaryCard}
            onPress={() => router.push('/(tabs)/ask')}
          >
            <View style={styles.cardIcon}>
              <MessageCircleQuestion size={32} color="#9A6BFF" />
            </View>
            <Text style={styles.cardTitle}>Ask About My Partner</Text>
            <Text style={styles.cardSubtitle}>Get insights and understanding</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryCard}
            onPress={() => {/* Navigate to questions history */}}
          >
            <View style={styles.cardIcon}>
              <Clock size={28} color="#999999" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Past Questions</Text>
              <Text style={styles.cardSubtitle}>Review previous insights</Text>
            </View>
          </TouchableOpacity>
        </View>

        {recentQuestions.length > 0 && (
          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Questions</Text>
            {recentQuestions.map((question) => (
              <TouchableOpacity 
                key={question.id}
                style={styles.activityItem}
                onPress={() => {
                  if (question.status === 'answered') {
                    router.push({
                      pathname: '/insights',
                      params: { 
                        questionId: question.id,
                        partnerName: partnerName || 'Partner'
                      }
                    });
                  }
                }}
              >
                <View style={[styles.activityDot, { backgroundColor: getStatusColor(question.status) }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText} numberOfLines={2}>
                    {question.question_text}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityStatus}>
                      {getStatusText(question.status)}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(question.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {question.status === 'answered' && (
                  <Heart size={16} color="#34D399" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isConnected && (
          <View style={styles.connectPrompt}>
            <Text style={styles.connectTitle}>Connect with Your Partner</Text>
            <Text style={styles.connectSubtitle}>
              To start asking questions, you need to connect with your partner first.
            </Text>
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.connectButtonText}>Connect Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <NotificationPermissionPrompt
        visible={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
        onPermissionGranted={() => {
          console.log('Notification permission granted!');
        }}
      />
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
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  statusText: {
    fontSize: 16,
    color: '#999999',
  },
  mainActions: {
    gap: 16,
    marginBottom: 40,
  },
  primaryCard: {
    backgroundColor: '#F8F8F8',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F8F8F8',
    gap: 16,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  recentActivity: {
    marginBottom: 32,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 8,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9A6BFF',
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 22,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityStatus: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 14,
    color: '#999999',
  },
  connectPrompt: {
    backgroundColor: '#F8F8F8',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  connectButton: {
    backgroundColor: '#9A6BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});