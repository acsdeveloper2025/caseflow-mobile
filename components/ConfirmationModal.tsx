import React, { ReactNode } from 'react';
import Modal from './Modal';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  saveText?: string;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onConfirm,
  title,
  children,
  saveText = 'Save',
  confirmText = 'Confirm',
}) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} title={title}>
      <StyledView className="space-y-4">
        {children}
        <StyledView className="flex-row justify-end gap-4 mt-6">
          <StyledTouchableOpacity
            onPress={onSave}
            className="px-4 py-2 rounded-md bg-purple-600 active:bg-purple-500"
          >
            <StyledText className="text-white font-semibold">{saveText}</StyledText>
          </StyledTouchableOpacity>
          <StyledTouchableOpacity
            onPress={onConfirm}
            className="px-4 py-2 rounded-md bg-brand-primary active:bg-brand-secondary"
          >
            <StyledText className="text-white font-semibold">{confirmText}</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default ConfirmationModal;
