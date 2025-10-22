import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Github,
  Linkedin,
  Camera,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

interface OnboardingData {
  avatar: string;
  bio: string;
  major: string;
  year: string;
  githubUsername: string;
  linkedinUsername: string;
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=' + (user?.name || 'default'),
    bio: '',
    major: '',
    year: '',
    githubUsername: '',
    linkedinUsername: '',
  });

  const steps = [
    {
      title: 'Profile Picture',
      subtitle: 'Add a photo to personalize your profile',
      icon: Camera,
    },
    {
      title: 'About You',
      subtitle: 'Tell us a bit about yourself',
      icon: User,
    },
    {
      title: 'Academic Info',
      subtitle: 'Share your academic details',
      icon: GraduationCap,
    },
    {
      title: 'Connect Accounts',
      subtitle: 'Link your professional profiles',
      icon: Github,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)/(home)' as any);
    } catch (error) {
      console.error('Onboarding completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/(home)' as any);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.bio.trim().length > 0;
      case 2:
        return data.major.trim().length > 0 && data.year.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity style={styles.avatarContainer}>
              <Image source={{ uri: data.avatar }} style={styles.avatar} />
              <View style={styles.avatarOverlay}>
                <Camera size={32} color={Colors.white} />
                <Text style={styles.avatarOverlayText}>Change Photo</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Tap to upload a profile picture or use the default avatar
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.inputLabelText}>Bio</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write a short bio about yourself..."
                placeholderTextColor={Colors.textLight}
                value={data.bio}
                onChangeText={(text) => setData({ ...data, bio: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{data.bio.length}/200</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <BookOpen size={20} color={Colors.primary} />
                <Text style={styles.inputLabelText}>Major / Field of Study</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Computer Science"
                placeholderTextColor={Colors.textLight}
                value={data.major}
                onChangeText={(text) => setData({ ...data, major: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.inputLabelText}>Year</Text>
              </View>
              <View style={styles.yearOptions}>
                {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearOption,
                      data.year === year && styles.yearOptionActive,
                    ]}
                    onPress={() => setData({ ...data, year })}
                  >
                    <Text
                      style={[
                        styles.yearOptionText,
                        data.year === year && styles.yearOptionTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Github size={20} color={Colors.primary} />
                <Text style={styles.inputLabelText}>GitHub Username</Text>
              </View>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={[styles.input, styles.inputWithPrefixField]}
                  placeholder="username"
                  placeholderTextColor={Colors.textLight}
                  value={data.githubUsername}
                  onChangeText={(text) => setData({ ...data, githubUsername: text })}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Linkedin size={20} color={Colors.primary} />
                <Text style={styles.inputLabelText}>LinkedIn Profile URL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://linkedin.com/in/username"
                placeholderTextColor={Colors.textLight}
                value={data.linkedinUsername}
                onChangeText={(text) => setData({ ...data, linkedinUsername: text })}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <Text style={styles.helperText}>
              These are optional but help others connect with you professionally
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepHeader}>
          <View style={styles.stepIconContainer}>
            <StepIcon size={32} color={Colors.white} />
          </View>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <ChevronLeft size={20} color={Colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              !canProceed() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
                </Text>
                <ChevronRight size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: Colors.white,
    width: 24,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  stepHeader: {
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  stepContent: {
    gap: 24,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.backgroundSecondary,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  avatarOverlayText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  yearOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  yearOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  yearOptionActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  yearOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  yearOptionTextActive: {
    color: Colors.primary,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 16,
  },
  inputPrefix: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  inputWithPrefixField: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  helperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
});
