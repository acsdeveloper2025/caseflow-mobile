import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, title, children }) => {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-center items-center bg-black/70 p-4">
        <StyledSafeAreaView className="w-full max-w-lg">
            <StyledView className="bg-dark-card rounded-lg shadow-2xl p-6">
                <StyledView className="flex-row justify-between items-center mb-4 pb-2 border-b border-dark-border">
                    <StyledText className="text-xl font-bold text-light-text">{title}</StyledText>
                    <StyledTouchableOpacity onPress={onClose} className="p-1">
                        <StyledText className="text-medium-text text-2xl">&times;</StyledText>
                    </StyledTouchableOpacity>
                </StyledView>
                <StyledView>
                    {children}
                </StyledView>
            </StyledView>
        </StyledSafeAreaView>
      </StyledView>
    </RNModal>
  );
};

export default Modal;
