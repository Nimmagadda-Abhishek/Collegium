import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, Plus, Github } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function CreateProjectScreen() {
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [githubRepo, setGithubRepo] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    console.log('Creating project:', { title, description, githubRepo, tags });
    
    router.push('/project/new-project-123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Create Project',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: Colors.text,
          },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Project Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project title"
            placeholderTextColor={Colors.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project idea..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Github size={18} color={Colors.text} />
            <Text style={styles.label}>GitHub Repository (Optional)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="https://github.com/username/repo"
            placeholderTextColor={Colors.textLight}
            value={githubRepo}
            onChangeText={setGithubRepo}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Link your GitHub repo for automatic commit tracking
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tags (Max 5)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              placeholderTextColor={Colors.textLight}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addTagButton, !tagInput.trim() && styles.addTagButtonDisabled]}
              onPress={addTag}
              disabled={!tagInput.trim() || tags.length >= 5}
            >
              <Plus size={20} color={tagInput.trim() && tags.length < 5 ? Colors.white : Colors.textLight} />
            </TouchableOpacity>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <X size={14} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 After creating your project, you&apos;ll be able to invite team members, chat about the project, and track GitHub commits in real-time.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, (!title.trim() || !description.trim()) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || !description.trim()}
        >
          <Text style={styles.createButtonText}>Create Project</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: Colors.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.accent + '15',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  infoBox: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.border,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
