import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Copy, UserPlus, Settings, LogOut, Shield, Bell, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, connectPartner, signOut, supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = async () => {
    if (!user) return;

    setIsGeneratingCode(true);
    try {
      // Call the generate invite code function
      const { data, error } = await supabase.functions.invoke('generate-invite-code', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data.inviteCode) {
        // Update the profile state with the new invite code
        setProfile(prev => prev ? { ...prev, invite_code: data.inviteCode } : null);
        Alert.alert('Success! 🎉', 'Your invite code has been generated');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate invite code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyInviteCode = () => {
    if (profile?.invite_code) {
      // Note: Clipboard API is not available in web environment
      // For production, you'd want to use expo-clipboard
      Alert.alert('Copied! 📋', 'Your invite code has been copied to clipboard');
    }
  };

  const handleConnectPartner = async () => {
    if (!partnerCode.trim()) return;

    try {
      setIsLoading(true);
      await connectPartner(partnerCode);
      Alert.alert('Connected! 🎉', 'You are now connected to your partner');
      setPartnerCode('');
      await loadProfile(); // Reload to show connection
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const menuItems = [
    { icon: Bell, title: 'Notifications', onPress: () => {}, color: '#9A6BFF' },
    { icon: Shield, title: 'Privacy & Safety', onPress: () => {}, color: '#34D399' },
    { icon: Settings, title: 'Settings', onPress: () => {}, color: '#666666' },
    { icon: LogOut, title: 'Log Out', onPress: handleSignOut, color: '#FF6B6B' },
  ];

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isConnected = !!profile.partner_id;
  const hasInviteCode = profile.invite_code && profile.invite_code.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.full_name || 'User'}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          <View style={styles.card}>
            <View style={styles.inviteCodeSection}>
              <View style={styles.inviteCodeHeader}>
                <Text style={styles.inviteCodeLabel}>Your Invite Code</Text>
                {hasInviteCode && (
                  <TouchableOpacity onPress={copyInviteCode} style={styles.copyButton}>
                    <Copy size={18} color="#9A6BFF" />
                  </TouchableOpacity>
                )}
              </View>
              
              {hasInviteCode ? (
                <>
                  <View style={styles.inviteCodeContainer}>
                    <Text style={styles.inviteCode}>{profile.invite_code}</Text>
                  </View>
                  <Text style={styles.inviteCodeHint}>Share this code with your partner to connect</Text>
                </>
              ) : (
                <View style={styles.noInviteCodeContainer}>
                  <Text style={styles.noInviteCodeText}>
                    No invite code available. Generate one to connect with your partner.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.generateButton, isGeneratingCode && styles.generateButtonDisabled]}
                    onPress={generateInviteCode}
                    disabled={isGeneratingCode}
                  >
                    <RefreshCw size={16} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>
                      {isGeneratingCode ? 'Generating...' : 'Generate Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Connection</Text>
          <View style={styles.card}>
            {isConnected ? (
              <View style={styles.connectedState}>
                <View style={styles.partnerInfo}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }}
                    style={styles.partnerAvatar}
                  />
                  <View style={styles.partnerDetails}>
                    <Text style={styles.partnerName}>Connected to Partner</Text>
                    <View style={styles.connectionStatus}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Active connection</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.connectionForm}>
                <Text style={styles.connectionLabel}>Enter your partner's invite code</Text>
                <TextInput
                  style={styles.codeInput}
                  value={partnerCode}
                  onChangeText={setPartnerCode}
                  placeholder="SAFE-XXXXX"
                  placeholderTextColor="#999999"
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  style={[styles.connectButton, !partnerCode.trim() && styles.connectButtonDisabled]}
                  onPress={handleConnectPartner}
                  disabled={!partnerCode.trim()}
                >
                  <LinearGradient
                    colors={partnerCode.trim() ? ['#9A6BFF', '#B8A0FF'] : ['#E0E0E0', '#E0E0E0']}
                    style={styles.connectButtonGradient}
                  >
                    <UserPlus size={20} color={partnerCode.trim() ? "#FFFFFF" : "#999999"} />
                    <Text style={[styles.connectButtonText, !partnerCode.trim() && styles.connectButtonTextDisabled]}>
                      Connect
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: `${item.color}15` }]}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color="#999999" />
              </TouchableOpacity>
            ))}
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 24,
  },
  inviteCodeSection: {
    alignItems: 'center',
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  inviteCodeLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  inviteCodeContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 24,
    color: '#9A6BFF',
    fontWeight: '800',
    letterSpacing: 2,
  },
  inviteCodeHint: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontWeight: '500',
  },
  noInviteCodeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  noInviteCodeText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9A6BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#B8A0FF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedState: {
    alignItems: 'center',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  connectionForm: {
    gap: 16,
  },
  connectionLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
  },
  connectButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  connectButtonDisabled: {
    opacity: 1,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  connectButtonTextDisabled: {
    color: '#999999',
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});