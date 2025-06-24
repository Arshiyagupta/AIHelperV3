import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafetyScreen } from '@/components/SafetyScreen';

export default function SafetyScreenPage() {
  const router = useRouter();
  const { severity = 'medium', category = 'general' } = useLocalSearchParams();

  const handleContinue = () => {
    // Navigate back to the previous screen or home
    router.back();
  };

  const handleExit = () => {
    // Navigate to home and clear the stack
    router.push('/(tabs)');
  };

  return (
    <SafetyScreen
      severity={severity as 'high' | 'medium' | 'low'}
      category={category as 'physical' | 'emotional' | 'control' | 'threats' | 'crisis' | 'general'}
      onContinue={handleContinue}
      onExit={handleExit}
    />
  );
}