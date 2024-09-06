import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform, Text, Alert, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Modal from 'react-native-modal';
import { storage } from '../../firebaseConfig';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import PropTypes from 'prop-types';

const ImagePickerModal = ({ isVisible, onClose, setReceiptFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [tempFilePathToUpload, setTempFilePathToUpload] = useState(null);
  const [tempFileNameToUpload, setTempFileNameToUpload] = useState(null);
  const [loading, setLoading] = useState(false);

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
        quality: 1,
      });
    } else if (source === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1,1],
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

      setTempFilePathToUpload(tempFilePath);
      setTempFileNameToUpload(fileName);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const uploadResult = await uploadFileToFirebaseStorage(tempFilePathToUpload, tempFileNameToUpload);
      setReceiptFile(uploadResult.downloadURL);
      if (uploadResult.downloadURL) {
        setLoading(false);
        Alert.alert("Receipt Uploaded Successfully", 'Your receipt is successfully added to the task', [
          {
            text: 'OK',
            onPress: () => {
              onClose();
            }
          }
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error uploading file:', error);
    }
  };

  ImagePickerModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    setReceiptFile: PropTypes.func.isRequired,
  };

  return (

    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.modalContent}>
        <Text style={styles.headerText}>Select File</Text>
        {
          loading ? (<ActivityIndicator animating={loading} size="large" color="#0000ff" /> ) : (
      <>
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => handleFilePick('camera')} style={styles.link}>
            <Text style={styles.linkText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilePick('gallery')} style={styles.link}>
            <Text style={styles.linkText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilePick('document')} style={styles.link}>
            <Text style={styles.linkText}>Choose PDF</Text>
          </TouchableOpacity>
        </View>
        {selectedFile && selectedFileType === 'image' && (
          <Image source={{ uri: selectedFile }} style={styles.filePreview} />
        )}
        {selectedFile && selectedFileType === 'pdf' && (
          <Text style={styles.filePreviewText}>PDF Selected: {tempFileNameToUpload}</Text>
        )}

</>)
        }
                <View style={styles.buttonContainer}>
         
          <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
           <TouchableOpacity onPress={handleUpload} style={[styles.button, styles.uploadButton]}>
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  linkContainer: {
    width: '100%',
    marginBottom: 15,
  },
  link: {
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
  filePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filePreviewText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#B0B0B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImagePickerModal;
