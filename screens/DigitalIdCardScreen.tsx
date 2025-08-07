import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { captureRef } from 'react-native-view-shot';
// import * as MediaLibrary from 'expo-media-library';
// import * as FileSystem from 'expo-file-system';
import DigitalIdCard from '../components/DigitalIdCard';
import { useAuth } from '../context/AuthContext';

const DigitalIdCardScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<View>(null);

  // Mock user profile data - replace with actual user data from context/API
  const userProfile = {
    fullName: user?.name || 'John Doe',
    employeeId: user?.employeeId || 'EMP001',
    designation: user?.designation || 'Field Verification Officer',
    department: user?.department || 'Verification Services',
    validUntil: '31/12/2024',
    phoneNumber: user?.phone || '+91 9876543210',
    email: user?.email || 'john.doe@allcheckservices.com',
    profilePhoto: user?.profilePhoto,
  };

  const handleSaveToGallery = async () => {
    Alert.alert(
      'Save to Gallery',
      'This feature will be available in a future update when the app is deployed as a native mobile application.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Digital Employee ID Card\n\nName: ${userProfile.fullName}\nEmployee ID: ${userProfile.employeeId}\nDesignation: ${userProfile.designation}\n\nAll Check Services LLP`,
      });
    } catch (error) {
      console.error('Error sharing ID card:', error);
      Alert.alert('Error', 'Failed to share ID card. Please try again.');
    }
  };

  const handlePrint = () => {
    Alert.alert(
      'Print ID Card',
      'This feature will be available in a future update. For now, you can save the ID card to your gallery and print it from there.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Digital ID Card</Text>
          <Text style={styles.headerSubtitle}>
            Your official employee identification card
          </Text>
        </View>

        {/* ID Card Display */}
        <View style={styles.cardSection}>
          <View ref={cardRef} style={styles.cardWrapper}>
            <DigitalIdCard userProfile={userProfile} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSaveToGallery}
            disabled={isLoading}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 20 }}>💾</Text>
            <Text style={styles.primaryButtonText}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
            disabled={isLoading}
          >
            <Text style={{ color: '#10B981', fontSize: 20 }}>📤</Text>
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handlePrint}
            disabled={isLoading}
          >
            <Text style={{ color: '#10B981', fontSize: 20 }}>🖨️</Text>
            <Text style={styles.secondaryButtonText}>Print</Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={{ fontSize: 24, color: '#10B981' }}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How to Use Your Digital ID</Text>
              <Text style={styles.infoText}>
                • Show this digital ID to clients and authorities for verification{'\n'}
                • Save to your gallery for offline access{'\n'}
                • Share with colleagues or supervisors when needed{'\n'}
                • Keep your profile updated for accurate information
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={{ fontSize: 24, color: '#059669' }}>🛡️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Security Features</Text>
              <Text style={styles.infoText}>
                • Official company logo and branding{'\n'}
                • Authorized signature and stamp{'\n'}
                • Employee verification details{'\n'}
                • Valid until date for authenticity
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This digital ID card is valid for official verification purposes.
            Keep your profile information updated to ensure accuracy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 40, // Add top padding to replace SafeAreaView
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardWrapper: {
    // This wrapper helps with the screenshot capture
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DigitalIdCardScreen;
