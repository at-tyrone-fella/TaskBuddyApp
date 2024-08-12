import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Platform, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Modal from 'react-native-modal';
import { storage } from '../../firebaseConfig';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const ImagePickerModal = ({ isVisible, onClose, onFilePicked }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);

  const uploadFileToFirebaseStorage = async (uri, fileName) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `files/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const handleFilePick = async (source) => {
    let result;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (source === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (source === 'document') {
      result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      console.log("result: ", result.assets[0].uri);
    }

    if (result.type !== 'cancel') {
      let uri;
      let fileName;

      if (source === 'document') {
        uri = result.assets[0].uri;
        fileName = result.assets[0].name;
        setSelectedFileType('pdf');
      } else {
        uri = result.assets[0].uri;
        fileName = `temp_${Date.now()}.${selectedFileType || 'jpg'}`;
        setSelectedFileType('image');
      }

      const tempFilePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: tempFilePath });
      setSelectedFile(tempFilePath);

      const uploadResult = await uploadFileToFirebaseStorage(tempFilePath, fileName);

      onFilePicked(uploadResult.downloadURL);
    }

    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Button title="Take Photo" onPress={() => handleFilePick('camera')} style={styles.button} />
        <Button title="Choose from Gallery" onPress={() => handleFilePick('gallery')} />
        <Button title="Choose PDF" onPress={() => handleFilePick('document')} />
        {selectedFile && selectedFileType === 'image' && (
          <Image source={{ uri: selectedFile }} style={styles.filePreview} />
        )}
        {selectedFile && selectedFileType === 'pdf' && (
          <Text style={styles.filePreviewText}>PDF Selected: {selectedFile}</Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  filePreview: {
    width: 100,
    height: 100,
    marginTop: 20,
  },
  filePreviewText: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default ImagePickerModal;
