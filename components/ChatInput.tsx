import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  value, 
  onChangeText, 
  onSend, 
  placeholder = "Type a message...",
  disabled = false 
}: ChatInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline
          maxLength={500}
          editable={!disabled}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!value.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={onSend}
          disabled={!value.trim() || disabled}
        >
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 8,
    maxHeight: 100,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  sendButton: {
    backgroundColor: '#9A6BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});