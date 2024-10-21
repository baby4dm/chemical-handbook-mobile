import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

// Оновлення стану для 'searchBy', щоб включити нові варіанти пошуку
const [searchBy, setSearchBy] = useState<'name' | 'oon' | 'haz' | 'imdg' | 'formula' | null>(null);

// Оновлена функція для відкриття модального вікна пошуку
const openSearchModal = (type: 'name' | 'oon' | 'haz' | 'imdg' | 'formula') => {
  setSearchBy(type);

  // Очищення полів пошуку для всіх критеріїв
  setSearchNameQuery('');
  setOon('');
  setSearchHazQuery('');
  setSearchImdgQuery('');
  setSearchFormulaQuery('');

  setSearchModalVisible(true);
};

// Функція для закриття модального вікна
const closeSearchModal = () => {
  setSearchModalVisible(false);

  // Очищення всіх полів при закритті модального вікна
  setSearchNameQuery('');
  setOon('');
  setSearchHazQuery('');
  setSearchImdgQuery('');
  setSearchFormulaQuery('');
};

const openResultsModal = async () => {
  let url = '';
  let query = '';

  switch (searchBy) {
    case 'oon':
      if (!oon.trim()) {
        Alert.alert('Error', 'Please enter a valid OОН number.');
        return;
      }
      url = `http://10.138.134.126:8080/substances/oon-number/${oon}`;
      break;
    case 'name':
      if (!searchNameQuery.trim()) {
        Alert.alert('Error', 'Please enter a valid name.');
        return;
      }
      query = encodeURIComponent(searchNameQuery);
      url = `http://10.138.134.126:8080/substances/${query}`;
      break;
    case 'haz':
      if (!searchHazQuery.trim()) {
        Alert.alert('Error', 'Please enter a valid HAZ code.');
        return;
      }
      query = encodeURIComponent(searchHazQuery);
      url = `http://10.138.134.126:8080/substances/haz/${query}`;
      break;
    case 'imdg':
      if (!searchImdgQuery.trim()) {
        Alert.alert('Error', 'Please enter a valid IMDG code.');
        return;
      }
      query = encodeURIComponent(searchImdgQuery);
      url = `http://10.138.134.126:8080/substances/imdg/${query}`;
      break;
    case 'formula':
      if (!searchFormulaQuery.trim()) {
        Alert.alert('Error', 'Please enter a valid chemical formula.');
        return;
      }
      query = encodeURIComponent(searchFormulaQuery);
      url = `http://10.138.134.126:8080/substances/formula/${query}`;
      break;
    default:
      Alert.alert('Error', 'Invalid search type.');
      return;
  }

  try {
    console.log(`Sending request to: ${url}`); // Log the URL for debugging
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`Network response was not ok (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('Received result:', result);
    setSelectedSubstance(result);
    setResultsModalVisible(true);
    setSearchModalVisible(false);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error details:', error);
      Alert.alert('Error', `Failed to fetch results: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
      Alert.alert('Error', 'An unknown error occurred.');
    }
  }
};
  

  const closeResultsModal = () => {
    setResultsModalVisible(false);
    setSelectedSubstance(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
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
          <TouchableOpacity style={styles.button} onPress={() => openSearchModal('name')}>
            <ThemedText style={styles.buttonText}>Довідник речовин</ThemedText>
          </TouchableOpacity>
        </View>
        {/* Search Modal */}
        <Modal visible={searchModalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
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
      ) : null}

      <TouchableOpacity style={styles.searchButton} onPress={openResultsModal}>
        <ThemedText style={styles.searchButtonText}>Пошук</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={closeSearchModal}>
        <ThemedText style={styles.buttonText}>Закрити</ThemedText>
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
                <ThemedText style={styles.buttonText}>Закрити</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    margin: 5,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchButtonText: {
    color: '#000', // Text color set to black
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#007BFF', // Optional: change to match button style
    padding: 15,
    borderRadius: 8,
  },
  infoCard: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#000',
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
});

export default SubstancesScreen;
