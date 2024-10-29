import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';



interface Substance {
  oon: number;
  name: string;
  code: string;
  formula: string;
  description: string;
  aggregationState: string;
  densityAir: string;
  densityWater: string;
  solubility: string;
  generalDanger: string;
  waterDanger: string;
  healthDanger: string;
  imdg: string;
  haz: string;
  lethal: number;
  container: string;
  limitConcentration: number;
  dangerSquare: {
    health: number;
    fire: number;
    chemistry: number;
    other: number;
  };
}

const SubstancesScreen: React.FC = () => {
const [searchNameQuery, setSearchNameQuery] = useState('');
const [oon, setOon] = useState('');
const [searchHazQuery, setSearchHazQuery] = useState(''); // HAZ код
const [searchImdgQuery, setSearchImdgQuery] = useState(''); // IMDG код
const [searchFormulaQuery, setSearchFormulaQuery] = useState(''); // Хімічна формула
const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
const [searchModalVisible, setSearchModalVisible] = useState(false);
const [resultsModalVisible, setResultsModalVisible] = useState(false);
const [substanceIds, setSubstanceIds] = useState<number[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
  

// Оновлення стану для 'searchBy', щоб включити нові варіанти пошуку
const [searchBy, setSearchBy] = useState<'name' | 'oon' | 'haz' | 'imdg' | 'formula' | 'all' | null>(null);

const fetchSubstanceIds = async () => {
  setIsLoading(true);
  try {
    const url = 'http://10.138.134.126:8080/substances/ids';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    
    const ids = await response.json();
    setSubstanceIds(ids);
    
    if (ids.length > 0) {
      setCurrentIndex(0);
      await fetchSubstanceById(ids[0]);
    }
  } catch (error) {
    console.error('Error fetching substance IDs:', error);
    Alert.alert('Помилка', 'Не вдалося отримати список речовин');
  } finally {
    setIsLoading(false);
  }
};

const fetchSubstanceById = async (oon: number) => {
  setIsLoading(true);
  try {
    const url = `http://10.138.134.126:8080/substances/oon-number/${oon}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    
    const substance = await response.json();
    setSelectedSubstance(substance);
    setResultsModalVisible(true);
  } catch (error) {
    console.error('Error fetching substance:', error);
    Alert.alert('Помилка', 'Не вдалося отримати інформацію про речовину');
  } finally {
    setIsLoading(false);
  }
};

const handleNext = () => {
  if (currentIndex < substanceIds.length - 1) {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    fetchSubstanceById(substanceIds[nextIndex]);
  }
};

const handlePrevious = () => {
  if (currentIndex > 0) {
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    fetchSubstanceById(substanceIds[prevIndex]);
  }
};

const openSearchModal = (type: 'name' | 'oon' | 'haz' | 'imdg' | 'formula' | 'all') => {
  setSearchBy(type);
  if (type === 'all') {
    fetchSubstanceIds();
  } else {
    setSearchNameQuery('');
    setOon('');
    setSearchHazQuery('');
    setSearchImdgQuery('');
    setSearchFormulaQuery('');
    setSearchModalVisible(true);
  }
};

const closeSearchModal = () => {
  setSearchModalVisible(false);
  setSearchNameQuery('');
  setOon('');
  setSearchHazQuery('');
  setSearchImdgQuery('');
  setSearchFormulaQuery('');
};

const openResultsModal = async () => {
  setIsLoading(true);
  let url = '';
  let query = '';

  switch (searchBy) {
    case 'oon':
      if (!oon.trim()) {
        Alert.alert('Помилка', 'Будь-ласка введіть коректний ООН-номер.');
        setIsLoading(false);
        return;
      }
      url = `http://10.138.134.126:8080/substances/oon-number/${oon}`;
      break;
    case 'name':
      if (!searchNameQuery.trim()) {
        Alert.alert('Помилка', 'Будь-ласка введіть коректну назву речовини.');
        setIsLoading(false);
        return;
      }
      query = encodeURIComponent(searchNameQuery);
      url = `http://10.138.134.126:8080/substances/${query}`;
      break;
    case 'haz':
      if (!searchHazQuery.trim()) {
        Alert.alert('Помилка', 'Будь-ласка введіть коректний HAZ-код.');
        setIsLoading(false);
        return;
      }
      query = encodeURIComponent(searchHazQuery);
      url = `http://10.138.134.126:8080/substances/haz/${query}`;
      break;
    case 'imdg':
      if (!searchImdgQuery.trim()) {
        Alert.alert('Помилка', 'Будь-ласка введіть коректний IMDG-код.');
        setIsLoading(false);
        return;
      }
      query = encodeURIComponent(searchImdgQuery);
      url = `http://10.138.134.126:8080/substances/imdg/${query}`;
      break;
    case 'formula':
      if (!searchFormulaQuery.trim()) {
        Alert.alert('Помилка', 'Будь-ласка введіть коректну формулу.');
        setIsLoading(false);
        return;
      }
      query = encodeURIComponent(searchFormulaQuery);
      url = `http://10.138.134.126:8080/substances/formula/${query}`;
      break;
    default:
      Alert.alert('Помилка', 'Введено некоректні дані.');
      setIsLoading(false);
      return;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const result = await response.json();
    setSelectedSubstance(result);
    setResultsModalVisible(true);
    setSearchModalVisible(false);
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Помилка', 'Даних не знайдено.');
  } finally {
    setIsLoading(false);
  }
};

const closeResultsModal = () => {
  setResultsModalVisible(false);
  setSelectedSubstance(null);
  setCurrentIndex(0);
  setSubstanceIds([]);
};

return (
  <ThemedView style={styles.mainContainer}>
    <ThemedView style={styles.innerContainer}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('name')}>
          <ThemedText style={styles.buttonText}>Пошук за назвою</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('oon')}>
          <ThemedText style={styles.buttonText}>Пошук за ООН - номером</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('haz')}>
          <ThemedText style={styles.buttonText}>Пошук за HAZ кодом</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('imdg')}>
          <ThemedText style={styles.buttonText}>Пошук за IMDG кодом</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('formula')}>
          <ThemedText style={styles.buttonText}>Пошук за формулою</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openSearchModal('all')}>
          <ThemedText style={styles.buttonText}>Довідник речовин</ThemedText>
        </TouchableOpacity>
      </View>
        {/* Search Modal */}
        <Modal visible={searchModalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalSearchContainer}>
    <View style={styles.modalSearchContent}>
      {searchBy === 'oon' ? (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="ООН - номер"
            value={oon}
            keyboardType="numeric"
            onChangeText={setOon}
          />
        </>
      ) : searchBy === 'name' ? (
        <TextInput
          style={styles.searchInput}
          placeholder="Назва"
          value={searchNameQuery}
          onChangeText={setSearchNameQuery}
        />
      ) : searchBy === 'haz' ? (
        <TextInput
          style={styles.searchInput}
          placeholder="HAZ код"
          value={searchHazQuery}
          onChangeText={setSearchHazQuery}
        />
      ) : searchBy === 'imdg' ? (
        <TextInput
          style={styles.searchInput}
          placeholder="IMDG код"
          value={searchImdgQuery}
          onChangeText={setSearchImdgQuery}
        />
      ) : searchBy === 'formula' ? (
        <TextInput
          style={styles.searchInput}
          placeholder="Хімічна формула"
          value={searchFormulaQuery}
          onChangeText={setSearchFormulaQuery}
        />
      ) : 
      null}

      <TouchableOpacity style={styles.searchButton} onPress={openResultsModal}>
        <ThemedText style={styles.searchButtonText}>Пошук</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={closeSearchModal}>
        <ThemedText style={styles.closeButtonText}>Закрити</ThemedText>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


        {/* Results Modal */}
        <Modal visible={resultsModalVisible} animationType="slide" transparent={true}>
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
              
              <Text style={styles.modalSubtitle}>Властивості речовини</Text>
              
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
                <Text style={styles.boldText}>Загальна небезпека: </Text>
                <Text style={styles.italicText}>{selectedSubstance.generalDanger}</Text>
              </Text>
            
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Небезпека з водою: </Text>
                <Text style={styles.italicText}>{selectedSubstance.waterDanger}</Text>
              </Text>
            
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Небезпека для здоров'я: </Text>
                <Text style={styles.italicText}>{selectedSubstance.healthDanger}</Text>
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>IMDG: </Text>
                <Text style={styles.italicText}>{selectedSubstance.imdg}</Text>
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>HAZ: </Text>
                <Text style={styles.italicText}>{selectedSubstance.haz}</Text>
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Летальна доза: </Text>
                <Text style={styles.italicText}>{selectedSubstance.lethal}</Text>
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Гранично допустима концентрація: </Text>
                <Text style={styles.italicText}>{selectedSubstance.limitConcentration}</Text>
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Стійкість тари: </Text>
                <Text style={styles.italicText}>{selectedSubstance.container}</Text>
              </Text>
            
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
          {searchBy === 'all' && substanceIds.length > 0 && (
              <View style={styles.navigationContainer}>
                <TouchableOpacity 
                  style={[
                    styles.navigationButton,
                    currentIndex === 0 && styles.navigationButtonDisabled
                  ]}
                  onPress={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ThemedText style={styles.navigationButtonText}>Попередня</ThemedText>
                </TouchableOpacity>

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicator}>
                    {`${currentIndex + 1} / ${substanceIds.length}`}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.navigationButton,
                    currentIndex === substanceIds.length - 1 && styles.navigationButtonDisabled
                  ]}
                  onPress={handleNext}
                  disabled={currentIndex === substanceIds.length - 1}
                >
                  <ThemedText style={styles.navigationButtonText}>Наступна</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeResultsModal}>
              <ThemedText style={styles.closeButtonText}>Закрити</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  </ThemedView>
);
};

const styles = StyleSheet.create({
  mainContainer:{
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  modalSearchContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSearchContent:{
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    width: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    margin: 5,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#1a73e8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontStyle: 'italic',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  searchButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007BFF',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#007BFF',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  allSubstancesContainer: {
    alignItems: 'center',
    width: '100%',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navigationButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
  },
  navigationButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  navigationButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pageIndicatorContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
});

export default SubstancesScreen;
