import React from 'react';
import { Modal, ModalProps, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type CustomModalProps = ModalProps & {
  children: React.ReactNode;
};

const CustomModal: React.FC<CustomModalProps> = ({ children, ...rest }) => {
  return (
    <Modal {...rest}>
      <GestureHandlerRootView style={styles.container}>
        {children}
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CustomModal;
