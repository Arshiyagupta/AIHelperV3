import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Phone, MessageSquare, ExternalLink, Heart } from 'lucide-react-native';

interface SafetyResource {
  name: string;
  phone?: string;
  website?: string;
  description: string;
}

interface SafetyScreenProps {
  severity: 'high' | 'medium' | 'low';
  category: 'physical' | 'emotional' | 'control' | 'threats' | 'crisis' | 'general';
  onContinue: () => void;
  onExit: () => void;
}

export function SafetyScreen({ severity, category, onContinue, onExit }: SafetyScreenProps) {
  const getResources = (): { title: string; description: string; resources: SafetyResource[] } => {
    if (severity === 'high' || category === 'physical' || category === 'threats') {
      return {
        title: "Your Safety Matters",
        description: "We detected something concerning in your conversation. If you're in immediate danger, please contact emergency services. You deserve to feel safe.",
        resources: [
          {
            name: "Emergency Services",
            phone: "911",
            description: "For immediate danger"
          },
          {
            name: "National Domestic Violence Hotline",
            phone: "1-800-799-7233",
            website: "https://www.thehotline.org",
            description: "24/7 confidential support"
          },
          {
            name: "Crisis Text Line",
            phone: "Text HOME to 741741",
            description: "24/7 crisis support via text"
          }
        ]
      };
    }

    if (category === 'crisis') {
      return {
        title: "You're Not Alone",
        description: "If you're having thoughts of self-harm, please know that help is available. You matter, and there are people who want to support you.",
        resources: [
          {
            name: "National Suicide Prevention Lifeline",
            phone: "988",
            description: "24/7 suicide prevention support"
          },
          {
            name: "Crisis Text Line",
            phone: "Text HOME to 741741",
            description: "24/7 crisis support via text"
          }
        ]
      };
    }

    return {
      title: "Support is Available",
      description: "We want to make sure you have access to support. You deserve to be treated with respect and kindness.",
      resources: [
        {
          name: "National Domestic Violence Hotline",
          phone: "1-800-799-7233",
          website: "https://www.thehotline.org",
          description: "Confidential support and resources"
        },
        {
          name: "RAINN National Sexual Assault Hotline",
          phone: "1-800-656-4673",
          website: "https://www.rainn.org",
          description: "Support for sexual assault survivors"
        },
        {
          name: "National Alliance on Mental Illness",
          phone: "1-800-950-6264",
          website: "https://www.nami.org",
          description: "Mental health support and resources"
        }
      ]
    };
  };

  const { title, description, resources } = getResources();

  const handlePhoneCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={48} color="#9A6BFF" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>Resources & Support</Text>
          
          {resources.map((resource, index) => (
            <View key={index} style={styles.resourceCard}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
              
              <View style={styles.resourceActions}>
                {resource.phone && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handlePhoneCall(resource.phone!)}
                  >
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{resource.phone}</Text>
                  </TouchableOpacity>
                )}
                
                {resource.website && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.websiteButton]}
                    onPress={() => handleWebsite(resource.website!)}
                  >
                    <ExternalLink size={16} color="#9A6BFF" />
                    <Text style={[styles.actionButtonText, styles.websiteButtonText]}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.supportMessage}>
          <Heart size={24} color="#FF6B6B" />
          <Text style={styles.supportText}>
            Remember: You deserve to be treated with love, respect, and kindness. 
            If something doesn't feel right, trust your instincts.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>Exit SafeTalk</Text>
        </TouchableOpacity>
        
        {severity !== 'high' && (
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>I'm Safe - Continue</Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    paddingTop: 32,
    marginBottom: 32,
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
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  resourcesSection: {
    marginBottom: 32,
  },
  resourcesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  resourceCard: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9A6BFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  websiteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9A6BFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  websiteButtonText: {
    color: '#9A6BFF',
  },
  supportMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
  },
  supportText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 12,
  },
  exitButton: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#9A6BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});