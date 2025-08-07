import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { toPng } from 'html-to-image';
import { CameraIcon, IdCardIcon, LogOutIcon, UserIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ProfilePhotoCapture from '../components/ProfilePhotoCapture';
import IdCard from '../components/IdCard';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const handlePhotoSave = async (dataUrl: string) => {
    await updateUserProfile({ profilePhotoUrl: dataUrl });
    setIsPhotoModalOpen(false);
  };

  const handleNavigateToDigitalId = () => {
    navigate('/digital-id-card');
  };

  const handleGenerateIdCard = useCallback(async () => {
    if (!idCardRef.current || !user?.profilePhotoUrl) {
      Alert.alert("Profile Photo Required", "Please upload a profile photo before generating an ID card.");
      return;
    }
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(idCardRef.current, { cacheBust: true });
      await updateUserProfile({ idCardUrl: dataUrl });
      Alert.alert("Success", "ID Card generated successfully!");
      setIsIdCardModalOpen(true);
    } catch (err) {
      console.error('Oops, something went wrong!', err);
      Alert.alert("Error", "Failed to generate ID card.");
    } finally {
      setIsGenerating(false);
    }
  }, [idCardRef, user, updateUserProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: '#111827', paddingTop: 40 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 100 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{
            position: 'relative',
            width: 128,
            height: 128,
            borderRadius: 64,
            backgroundColor: '#1F2937',
            borderWidth: 4,
            borderColor: '#374151',
            marginBottom: 16,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user?.profilePhotoUrl ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <UserIcon />
              </View>
            )}
            <TouchableOpacity
              onPress={() => setIsPhotoModalOpen(true)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                padding: 8,
                backgroundColor: '#00a950',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CameraIcon width={20} height={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F9FAFB', marginTop: 16 }}>{user?.name}</Text>
          <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Agent ID: {user?.id}</Text>
        </View>

        <View style={{ marginTop: 32, gap: 16 }}>
          {/* Digital ID Card Button */}
          <TouchableOpacity
            onPress={handleNavigateToDigitalId}
            style={{
              width: '100%',
              backgroundColor: '#10B981',
              padding: 12,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>🆔</Text>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>View Digital ID Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGenerateIdCard}
            disabled={isGenerating || !user?.profilePhotoUrl}
            style={{
              width: '100%',
              backgroundColor: isGenerating || !user?.profilePhotoUrl ? '#6B7280' : '#2563EB',
              padding: 12,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isGenerating || !user?.profilePhotoUrl ? 0.6 : 1
            }}
          >
            {isGenerating ? <Spinner size="small" /> : <IdCardIcon />}
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              {isGenerating ? "Generating..." : "Generate Legacy ID Card"}
            </Text>
          </TouchableOpacity>

          {user?.idCardUrl && (
            <TouchableOpacity
              onPress={() => setIsIdCardModalOpen(true)}
              style={{
                width: '100%',
                backgroundColor: '#6B7280',
                padding: 12,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <IdCardIcon />
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>View Legacy ID Card</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={logout}
            style={{
              width: '100%',
              backgroundColor: '#DC2626',
              padding: 12,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <LogOutIcon />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* This element is used for generating the ID card image and is not displayed directly */}
        <View style={{ position: 'absolute', left: -9999 }}>
          {user && <IdCard ref={idCardRef} user={user} />}
        </View>

        <Modal isVisible={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Take Profile Photo">
          <ProfilePhotoCapture onSave={handlePhotoSave} onCancel={() => setIsPhotoModalOpen(false)} />
        </Modal>

        <Modal isVisible={isIdCardModalOpen} onClose={() => setIsIdCardModalOpen(false)} title="Your Digital ID Card">
          {user?.idCardUrl ? (
            <Image source={{ uri: user.idCardUrl }} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
          ) : (
            <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>No ID card generated yet. Please generate one from your profile.</Text>
          )}
        </Modal>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
