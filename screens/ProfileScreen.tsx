import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
import { CameraIcon, IdCardIcon, LogOutIcon, UserIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ProfilePhotoCapture from '../components/ProfilePhotoCapture';
import IdCard from '../components/IdCard';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const handlePhotoSave = async (dataUrl: string) => {
    await updateUserProfile({ profilePhotoUrl: dataUrl });
    setIsPhotoModalOpen(false);
  };

  const handleGenerateIdCard = useCallback(async () => {
    if (!idCardRef.current || !user?.profilePhotoUrl) {
      alert("Please upload a profile photo before generating an ID card.");
      return;
    }
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(idCardRef.current, { cacheBust: true });
      await updateUserProfile({ idCardUrl: dataUrl });
      alert("ID Card generated successfully!");
      setIsIdCardModalOpen(true);
    } catch (err) {
      console.error('Oops, something went wrong!', err);
      alert("Failed to generate ID card.");
    } finally {
      setIsGenerating(false);
    }
  }, [idCardRef, user, updateUserProfile]);

  return (
    <div style={{ padding: '16px', paddingTop: '32px', paddingBottom: '100px', backgroundColor: '#111827', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          width: '128px',
          height: '128px',
          borderRadius: '64px',
          backgroundColor: '#1F2937',
          border: '4px solid #374151',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {user?.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt="Profile"
              style={{ width: '120px', height: '120px', borderRadius: '60px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <UserIcon />
            </div>
          )}
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              padding: '8px',
              backgroundColor: '#00a950',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CameraIcon width={20} height={20} color="white" />
          </button>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F9FAFB', margin: '0' }}>{user?.name}</h1>
        <p style={{ color: '#9CA3AF', margin: '8px 0 0 0' }}>Agent ID: {user?.id}</p>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={handleGenerateIdCard}
          disabled={isGenerating || !user?.profilePhotoUrl}
          style={{
            width: '100%',
            backgroundColor: isGenerating || !user?.profilePhotoUrl ? '#6B7280' : '#2563EB',
            color: 'white',
            fontWeight: '600',
            padding: '12px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: isGenerating || !user?.profilePhotoUrl ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isGenerating ? <Spinner size="small" /> : <IdCardIcon />}
          <span>{isGenerating ? "Generating..." : "Generate Digital ID Card"}</span>
        </button>

        {user?.idCardUrl && (
             <button
                onClick={() => setIsIdCardModalOpen(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
            >
                <IdCardIcon />
                <span>View My ID Card</span>
            </button>
        )}

        <button
          onClick={logout}
          style={{
            width: '100%',
            backgroundColor: '#DC2626',
            color: 'white',
            fontWeight: '600',
            padding: '12px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <LogOutIcon />
          <span>Logout</span>
        </button>
      </div>
      
      {/* This element is used for generating the ID card image and is not displayed directly */}
      <div style={{ position: 'fixed', left: '-9999px' }}>
          {user && <IdCard ref={idCardRef} user={user} />}
      </div>
      
      <Modal isVisible={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Take Profile Photo">
        <ProfilePhotoCapture onSave={handlePhotoSave} onCancel={() => setIsPhotoModalOpen(false)} />
      </Modal>

      <Modal isVisible={isIdCardModalOpen} onClose={() => setIsIdCardModalOpen(false)} title="Your Digital ID Card">
        {user?.idCardUrl ? (
            <img src={user.idCardUrl} alt="Digital ID Card" className="w-full h-auto rounded-lg" />
        ) : (
            <p className="text-medium-text text-center">No ID card generated yet. Please generate one from your profile.</p>
        )}
      </Modal>
    </div>
  );
};

export default ProfileScreen;
