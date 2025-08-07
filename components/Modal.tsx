import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, SafeAreaView } from 'react-native';


interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, title, children, size }) => {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 16
      }}>
        <SafeAreaView style={{ width: '100%', maxWidth: size === 'large' ? 800 : 500 }}>
            <View style={{
              backgroundColor: '#1F2937',
              borderRadius: 8,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#374151'
                }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F9FAFB' }}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                        <Text style={{ color: '#9CA3AF', fontSize: 24 }}>&times;</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    {children}
                </View>
            </View>
        </SafeAreaView>
      </View>
    </RNModal>
  );
};

export default Modal;
