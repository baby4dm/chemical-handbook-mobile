import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Search, FileText, Database, Scan, Info, Beaker } from 'lucide-react-native';
import { getHistory, addToHistory, clearHistory, HistoryItem } from '@/components/historyStorage';



interface Substance {
  oonNumber: number;
  name: string;
  dangerousNumber: string;
  formula: string;
  description: string;
  aggregationState: string;
  densityAir: string;
  densityWater: string;
  solubility: string;
  generalDanger: string;
  waterDanger: string;
  imdg: string;
  haz: string;
  container: string;
  respirationRecommendation: string;
  skinDefenseRecommendation: string;
  molecularWeight: number;
  flammabilityClass: string;
  temperatureProperties: {
    boilingPoint: number;
    freezePoint: number;
    meltingPoint: number;
    flashPoint: number;
  };
  healthInvolve: {
    lethal: number;
    limitConcentration: number;
    involveWays: string;
    symptoms: string;
    organImpacts: string;
  };
  firstAid: {
    eyes: string;
    skin: string;
    inhalation: string;
    swallowing: string;
  };
  dangerSquare: {
    health: number;
    fire: number;
    chemistry: number;
    other: number;
  };
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [currentSearchType, setCurrentSearchType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [recentSubstances, setRecentSubstances] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    const history = await getHistory();
    setRecentSubstances(history);
    const loadHistory = async () => {
      const history = await getHistory();
      console.log('Loaded history:', history);
      setRecentSubstances(history);
    };
  };


  const searchCategories = [
    { id: 'name', title: 'За назвою', Icon: FileText },
    { id: 'oon', title: 'За ООН номером', Icon: Database },
    { id: 'formula', title: 'За формулою', Icon: Beaker }, // перемістили в основний масив
    { id: 'haz', title: 'За HAZ кодом', Icon: Info },
    { id: 'imdg', title: 'За IMDG кодом', Icon: Scan },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim() && currentSearchType !== 'all') {
      Alert.alert('Помилка', 'Введіть пошуковий запит');
      return;
    }
  
    setIsLoading(true);
    try {
      let url = `http://10.138.134.232:8080/substances`;
      
      switch (currentSearchType) {
        case 'name':
          url += `/${encodeURIComponent(searchQuery)}`;
          break;
        case 'oon':
          url += `/oon-number/${searchQuery}`;
          break;
        case 'haz':
          url += `/haz/${encodeURIComponent(searchQuery)}`;
          break;
        case 'imdg':
          url += `/imdg/${encodeURIComponent(searchQuery)}`;
          break;
        case 'formula':
          url += `/formula/${encodeURIComponent(searchQuery)}`;
          break;
        default:
          throw new Error('Невідомий тип пошуку');
      }
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.name) {
        throw new Error('Речовину не знайдено');
      }
  
      setSelectedSubstance(data);
      
      // Зберігаємо в історію тільки якщо є валідні дані
      if (data && data.name && data.formula) {
        const updatedHistory = await addToHistory(data);
        setRecentSubstances(updatedHistory);
      }
      
      setSearchModalVisible(false);
      setResultsModalVisible(true);
      setSearchQuery('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Помилка', 
          error.message === 'Речовину не знайдено' 
            ? 'Речовину не знайдено' 
            : 'Помилка при пошуку речовини'
        );
      } else {
        Alert.alert('Помилка', 'Не вдалося здійснити пошук');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchModal = () => (
    <Modal
      visible={searchModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentSearchType === 'name' && 'Пошук за назвою'}
            {currentSearchType === 'oon' && 'Пошук за ООН номером'}
            {currentSearchType === 'haz' && 'Пошук за HAZ кодом'}
            {currentSearchType === 'imdg' && 'Пошук за IMDG кодом'}
            {currentSearchType === 'formula' && 'Пошук за формулою'}
          </Text>
          
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Введіть пошуковий запит..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              keyboardType={currentSearchType === 'oon' ? 'numeric' : 'default'}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setSearchModalVisible(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.cancelButtonText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.searchButton]}
              onPress={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Пошук</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );


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

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Клас горючості: </Text>
                <Text style={styles.italicText}>{selectedSubstance.flammabilityClass}</Text>
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
            <Text style={styles.modalText}>Інформацію не знайдено</Text>
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

return (
  <SafeAreaView style={styles.container}>
    <View style={styles.centered}>
      <View style={styles.grid}>
        {searchCategories.map(({ id, title, Icon }) => (
          <TouchableOpacity
            key={id}
            style={styles.categoryCard}
            onPress={() => {
              setCurrentSearchType(id);
              setSearchModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Icon size={24} color="#1a73e8" />
            <Text style={styles.categoryTitle}>{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {recentSubstances && recentSubstances.length > 0 && (
  <View style={styles.historyContainer}>
    <View style={styles.historyHeader}>
      <Text style={styles.historyTitle}>Недавно переглянуті</Text>
      <TouchableOpacity 
        onPress={async () => {
          await clearHistory();
          setRecentSubstances([]);
        }}
      >
        <Text style={styles.clearHistoryText}>Очистити</Text>
      </TouchableOpacity>
    </View>
    
    {recentSubstances.map((item) => (
  <TouchableOpacity
    key={item.name}  // Тепер використовуємо name як ключ
    style={styles.historyItem}
    onPress={async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://10.138.134.232:8080/substances/${encodeURIComponent(item.name)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch substance');
        }
        const data = await response.json();
        setSelectedSubstance(data);
        setResultsModalVisible(true);
      } catch (error) {
        Alert.alert('Помилка', 'Не вдалося завантажити дані про речовину');
      } finally {
        setIsLoading(false);
      }
    }}
  >
    <View>
      <Text style={styles.historyItemName}>{item.name}</Text>
      {item.formula && (
        <Text style={styles.historyItemFormula}>{item.formula}</Text>
      )}
    </View>
    <Search size={16} color="#666" />
  </TouchableOpacity>
))}
  </View>
)}
</View>
    {renderSearchModal()}
    {renderResultsModal()}
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    maxWidth: SCREEN_WIDTH,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    aspectRatio: 1.5,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  formulaCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    aspectRatio: 1.5,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderStyle: 'dashed',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#1a73e8',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: 16,
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#1a73e8',
  },
  historyList: {
    width: '100%',
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
});

export default ExploreScreen;