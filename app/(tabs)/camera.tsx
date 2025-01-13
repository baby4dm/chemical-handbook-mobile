import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Image, Alert, Modal, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Substance } from '@/components/substance';


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.9;

const OCR_SERVER_URL = `http://10.138.134.81:8080/substances/extract-text`;

type PhotoType = 
  | ImageManipulator.ImageResult 
  | CameraCapturedPicture 
  | ImagePicker.ImagePickerAsset 
  | null;

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<PhotoType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Для того щоб здійснити сканування потрібно надати дозвіл на використання камери</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Надати дозвіл</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 1, base64: true, exif: false };
        const scannedPhoto = await cameraRef.current.takePictureAsync(options) as CameraCapturedPicture;
  
        if (!scannedPhoto || !scannedPhoto.uri) {
          console.error("Failed to capture photo");
          return;
        }
  
        setIsLoading(true);
        const croppedPhoto = await cropImage(scannedPhoto.uri);
        setPhoto(croppedPhoto);
      } catch (error) {
        console.error("Error taking or manipulating picture:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cropImage = async (uri: string) => {
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.PNG }
    );
  
    const imageWidth = imageInfo.width;
    const imageHeight = imageInfo.height;
  
    const scaleX = imageWidth / SCREEN_WIDTH;
    const scaleY = imageHeight / SCREEN_HEIGHT;
  
    const cropWidth = SCAN_AREA_SIZE * scaleX;
    const cropHeight = SCAN_AREA_SIZE * scaleY;
    const originX = ((SCREEN_WIDTH - SCAN_AREA_SIZE) / 2) * scaleX;
    const originY = ((SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2) * scaleY;
  
    return await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX,
            originY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      { format: ImageManipulator.SaveFormat.PNG }
    );
  };

  const handleUploadFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setPhoto(selectedAsset);
      }
    } catch (error) {
      console.error("Error uploading image from gallery:", error);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  const resizeImage = async (uri: string) => {
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 800 } }],
      { format: ImageManipulator.SaveFormat.PNG }
    );
    return resizedImage;
  };

  const handleSendPhoto = async () => {
    if (!photo || !photo.uri) {
      Alert.alert("Помилка", "Немає фото для надсилання.");
      return;
    }
  
    setIsLoading(true);
    try {
      const resizedPhoto = await resizeImage(photo.uri);
      const formData = new FormData();
  
      const file = {
        uri: resizedPhoto.uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      };
  
      formData.append('file', file as any);
  
      console.log('Sending request to server...', { file });
  
      const response = await fetch(OCR_SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
  
      console.log('Server response status:', response.status);
  
      if (!response.ok) {
        throw new Error('HTTP error! status: ${response.status}');
      }
  
      const data = await response.json();
  
      console.log('Received data:', JSON.stringify(data, null, 2));
  
      if (data && data.name && data.formula) {
        const substance: Substance = {
          oonNumber: data.oon ?? 0,
          name: data.name ?? '',
          dangerousNumber: data.upperNumber?.toString() ?? '',
          formula: data.formula ?? '',
          description: data.description ?? '',
          aggregationState: data.aggregationState ?? '',
          densityAir: data.densityAir ?? '',
          densityWater: data.densityWater ?? '',
          solubility: data.solubility ?? '',
          generalDanger: data.generalDanger ?? '',
          waterDanger: data.waterDanger ?? '',
          imdg: data.imdg ?? '',
          haz: data.haz ?? '',
          container: data.container ?? '',
          respirationRecommendation: data.respirationRecommendation ?? '',
          skinDefenseRecommendation: data.skinDefenseRecommendation ?? '',
          molecularWeight: data.molecularWeight ?? 0,
          flammabilityClass: data.flammabilityClass ?? '',
          temperatureProperties: {
            boilingPoint: data.temperatureProperties?.boilingPoint ?? 0,
            freezePoint: data.temperatureProperties?.freezePoint ?? 0,
            meltingPoint: data.temperatureProperties?.meltingPoint ?? 0,
            flashPoint: data.temperatureProperties?.flashPoint ?? 0,
          },
          healthInvolve: {
            lethal: data.healthInvolve?.lethal ?? 0,
            limitConcentration: data.healthInvolve?.limitConcentration ?? 0,
            involveWays: data.healthInvolve?.involveWays ?? '',
            symptoms: data.healthInvolve?.symptoms ?? '',
            organImpacts: data.healthInvolve?.organImpacts ?? '',
          },
          firstAid: {
            eyes: data.firstAid?.eyes ?? '',
            skin: data.firstAid?.skin ?? '',
            inhalation: data.firstAid?.inhalation ?? '',
            swallowing: data.firstAid?.swallowing ?? '',
          },
          dangerSquare: {
            health: data.dangerSquare?.health ?? 0,
            fire: data.dangerSquare?.fire ?? 0,
            chemistry: data.dangerSquare?.chemistry ?? 0,
            other: data.dangerSquare?.other ?? 0,
          },        
        };
        
        
        setSelectedSubstance(substance);
        setResultsModalVisible(true);
      } else {
        console.error("Unexpected response format:", data);
        Alert.alert("Помилка", "Ніпдтримуваний формат даних.");
      }
  
    } catch (error: unknown) {
      console.error("Error sending image to server:", error);
      let errorMessage = "Failed to send image to server";
      if (error instanceof Error) {
        errorMessage += ' : ${error.message}';
      }
      Alert.alert("Помилка", 'Сталась непередбачувана помилка.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeResultsModal = () => {
    setResultsModalVisible(false);
    setSelectedSubstance(null);
  };

  const renderResultsModal = () => (
    <Modal
      visible={resultsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeResultsModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
                      {selectedSubstance ? (
                        <View style={styles.infoCard}>
                        <Text style={styles.modalTitle}>Інформація про речовину</Text>
                        
                        <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Назва: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.name}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Формула: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.formula}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Опис: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.description}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>OOH номер: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.oonNumber}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Число небезпеки: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.dangerousNumber}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>IMDG код: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.imdg}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>HAZ код: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.haz}</Text>
                                          </Text>
                        
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Клас горючості: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.flammabilityClass}</Text>
                                          </Text>
                          
                                          {/* Physical Properties */}
                                          <Text style={styles.modalSubtitle}>Фізичні властивості</Text>
                                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Агрегатний стан: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.aggregationState}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Густина за повітрям: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.densityAir}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Густина за водою: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.densityWater}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Розчинність: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.solubility}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Молекулярна вага: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.molecularWeight}</Text>
                                          </Text>
                          
                                          {/* Temperature Properties */}
                                          <Text style={styles.modalSubtitle}>Температурні властивості</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Температура кипіння: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.temperatureProperties.boilingPoint}°C</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Температура замерзання: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.temperatureProperties.freezePoint}°C</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Температура плавлення: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.temperatureProperties.meltingPoint}°C</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Температура спалахування: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.temperatureProperties.flashPoint}°C</Text>
                                          </Text>
                          
                                          {/* Hazard Information */}
                                          <Text style={styles.modalSubtitle}>Інформація про небезпеку</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Загальна небезпека: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.generalDanger}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Небезпека з водою: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.waterDanger}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Стійкість тари: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.container}</Text>
                                          </Text>
                          
                                          {/* Health Effects */}
                                          <Text style={styles.modalSubtitle}>Вплив на здоров'я</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Летальна доза: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.healthInvolve.lethal}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Гранично допустима концентрація: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.healthInvolve.limitConcentration}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Шляхи впливу: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.healthInvolve.involveWays}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Симптоми: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.healthInvolve.symptoms}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Вплив на органи: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.healthInvolve.organImpacts}</Text>
                                          </Text>
                          
                                          {/* Protection Recommendations */}
                                          <Text style={styles.modalSubtitle}>Рекомендації щодо захисту</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Захист дихання: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.respirationRecommendation}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Захист шкіри: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.skinDefenseRecommendation}</Text>
                                          </Text>
                          
                                          {/* First Aid */}
                                          <Text style={styles.modalSubtitle}>Перша допомога</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Очі: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.firstAid.eyes}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Шкіра: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.firstAid.skin}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>При вдиханні: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.firstAid.inhalation}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>При ковтанні: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.firstAid.swallowing}</Text>
                                          </Text>
                          
                                          {/* Danger Square */}
                                          <Text style={styles.modalSubtitle}>Квадрат небезпеки</Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Здоров'я: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.dangerSquare.health}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Пожежна: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.dangerSquare.fire}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Хімічна: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.dangerSquare.chemistry}</Text>
                                          </Text>
                          
                                          <Text style={styles.modalText}>
                                            <Text style={styles.boldText}>Примітки: </Text>
                                            <Text style={styles.italicText}>{selectedSubstance.dangerSquare.other}</Text>
                                          </Text>
                      </View>
                      
                      ) : (
                        <Text style={styles.modalText}>Інформації про речовину не знайдено</Text>
                      )}
                    </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={closeResultsModal}>
            <Text style={styles.closeButtonText}>ЗАКРИТИ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image 
          source={{ uri: photo.uri }} 
          style={[
            styles.previewImage, 
            photo.width && photo.height ? { aspectRatio: photo.width / photo.height } : null
          ]} 
          resizeMode="contain"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
            <Ionicons name="refresh" size={32} color="#1a73e8" />
            <Text style={styles.buttonText}>Сканувати</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabledButton]} 
            onPress={handleSendPhoto} 
            disabled={isLoading}
          >
            <Ionicons name="send" size={32} color="#1a73e8" />
            <Text style={styles.buttonText}>{isLoading ? 'Надсилання...' : 'Надіслати'}</Text>
          </TouchableOpacity>
        </View>
        {renderResultsModal()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <BlurView intensity={50} style={StyleSheet.absoluteFill}>
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.focusedContainer}>
                <View style={styles.scanArea} />
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
        </BlurView>
      </CameraView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleScan}>
          <Ionicons name="scan" size={32} color="#1a73e8" />
          <Text style={styles.buttonText}>Сканувати</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUploadFromGallery}>
          <Ionicons name="images" size={32} color="#1a73e8" />
          <Text style={styles.buttonText}>Завантажити</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 35,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  focusedContainer: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  scanArea: {
    borderColor: 'red',
    borderWidth: 4,
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewImage: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  bookmarksContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItemContent: {
    flex: 1,
    marginRight: 8,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  historyItemFormula: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a73e8',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  italicText: {
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#1a73e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookmarkButton: {
    paddingBottom: 10,
    paddingRight: 1,
  },
  infoCard: {
    marginBottom: 16,
  }
});