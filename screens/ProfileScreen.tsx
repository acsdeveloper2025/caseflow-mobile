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
    <div className="p-4 pt-8">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full bg-dark-card border-4 border-dark-border mb-4">
          {user?.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <UserIcon />
            </div>
          )}
           <button 
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute bottom-0 right-0 p-2 bg-brand-primary rounded-full text-white hover:bg-brand-secondary transition-colors"
                aria-label="Change Profile Photo"
            >
                <CameraIcon width={20} height={20} />
            </button>
        </div>
        <h1 className="text-2xl font-bold text-light-text">{user?.name}</h1>
        <p className="text-medium-text">Agent ID: {user?.id}</p>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={handleGenerateIdCard}
          disabled={isGenerating || !user?.profilePhotoUrl}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Spinner size="small" /> : <IdCardIcon />}
          <span>{isGenerating ? "Generating..." : "Generate Digital ID Card"}</span>
        </button>

        {user?.idCardUrl && (
             <button
                onClick={() => setIsIdCardModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            >
                <IdCardIcon />
                <span>View My ID Card</span>
            </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
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
