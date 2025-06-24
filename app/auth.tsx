import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp, signIn } from '@/lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
        
        const { inviteCode } = await signUp(email, password, name);
        Alert.alert(
          'Welcome to SafeTalk! 🎉', 
          `Your invite code is: ${inviteCode}\n\nShare this with your partner so they can connect with you.`,
          [{ text: 'Continue', onPress: () => router.push('/(tabs)') }]
        );
      } else {
        if (!email || !password) {
          Alert.alert('Error', 'Please enter your email and password');
          return;
        }
        
        await signIn(email, password);
        router.push('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F8F8']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp 
                  ? 'Start your journey to better understanding' 
                  : 'Continue your journey of connection'
                }
              </Text>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Log In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#999999"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#999999" />
                    ) : (
                      <Eye size={20} color="#999999" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonLoading]} 
                onPress={handleAuth}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading 
                    ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  }
                </Text>
              </TouchableOpacity>

              {!isSignUp && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  activeTabText: {
    color: '#1A1A1A',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#1A1A1A',
  },
  eyeButton: {
    padding: 18,
  },
  submitButton: {
    backgroundColor: '#9A6BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#9A6BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonLoading: {
    backgroundColor: '#B8A0FF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPasswordText: {
    color: '#9A6BFF',
    fontSize: 16,
    fontWeight: '600',
  },
});