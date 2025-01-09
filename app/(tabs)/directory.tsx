import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

interface Substance {
    id: number;
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

const DirectoryScreen = () => {
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchSubstances();
  }, []);

  const fetchSubstances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://10.138.134.232:8080/substances/ids');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const ids = await response.json();
      if (ids.length > 0) {
        const substanceDetails = await fetchSubstanceDetails(ids[0]);
        setSubstances([substanceDetails]);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити список речовин');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubstanceDetails = async (id: number) => {
    const response = await fetch(`http://10.138.134.232:8080/substances/oon-number/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  };

  const handleNext = async () => {
    // Implement pagination
  };

  const handlePrevious = async () => {
    // Implement pagination
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {substances.map((substance) => (
          <TouchableOpacity
            key={substance.id}
            style={styles.substanceCard}
            onPress={() => {
              setSelectedSubstance(substance);
              setModalVisible(true);
            }}
          >
            <Text style={styles.substanceName}>{substance.name}</Text>
            <Text style={styles.substanceFormula}>{substance.formula}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentPage === 0}
        >
          <Text style={styles.navButtonText}>Попередня</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>Наступна</Text>
        </TouchableOpacity>
      </View>

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Add your substance details modal content here */}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  substanceCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  substanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  substanceFormula: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default DirectoryScreen;