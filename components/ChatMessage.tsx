import { View, Text, StyleSheet } from 'react-native';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
}

export function ChatMessage({ message, isAI }: ChatMessageProps) {
  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <View style={styles.aiHeader}>
          <View style={styles.aiDot} />
          <Text style={styles.aiLabel}>SafeTalk AI</Text>
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    marginLeft: 4,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D364FF',
  },
  aiLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#F8F8F8',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#9A6BFF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: '#1A1A1A',
  },
  userText: {
    color: '#FFFFFF',
  },
});