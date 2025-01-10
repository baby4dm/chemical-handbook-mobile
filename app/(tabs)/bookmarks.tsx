import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Modal, Dimensions } from 'react-native';
import { getBookmarks, removeFromBookmarks } from '@/components/bookmarksStorage';
import { Trash2, Bookmark } from 'lucide-react-native';
import { Substance } from '@/components/substance';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Substance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const bookmarksList = await getBookmarks();
      setBookmarks(bookmarksList);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити закладки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (oonNumber: number) => {
    try {
      const removed = await removeFromBookmarks(oonNumber);
      if (removed) {
        setIsBookmarked(false);
        // Update bookmarks list immediately without reloading
        setBookmarks(prevBookmarks => 
          prevBookmarks.filter(bookmark => bookmark.oonNumber !== oonNumber)
        );
        setResultsModalVisible(false);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      Alert.alert('Помилка', 'Не вдалося видалити закладку');
    }
  };

  const renderResultsModal = () => (
    <Modal
      visible={resultsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setResultsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            {selectedSubstance && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.modalTitle}>Інформація про речовину</Text>
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => selectedSubstance && handleRemoveBookmark(selectedSubstance.oonNumber)}
                  >
                    <Bookmark size={24} color="#1a73e8" fill="#1a73e8" />
                  </TouchableOpacity>
                </View>

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
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setResultsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.bookmarksContainer}>
          {bookmarks.length > 0 ? (
            bookmarks.map((substance) => (
              <View key={substance.oonNumber} style={styles.historyItem}>
                <TouchableOpacity
                  style={styles.historyItemContent}
                  onPress={() => {
                    setSelectedSubstance(substance);
                    setResultsModalVisible(true);
                  }}
                >
                  <Text style={styles.historyItemName}>{substance.name}</Text>
                  <Text style={styles.historyItemFormula}>{substance.formula}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveBookmark(substance.oonNumber)}
                >
                  <Trash2 size={16} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Немає збережених закладок</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {renderResultsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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