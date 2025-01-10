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
  TextInput,
} from 'react-native';
import { Search, Filter, Bookmark } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { 
  Substance, 
  Filters, 
  AggregationState,
  DensityAir,
  DensityWater,
  GeneralDanger,
  Solubility,
  WaterDanger
} from '@/components/substance';
import { addToBookmarks, removeFromBookmarks, isSubstanceBookmarked } from '@/components/bookmarksStorage';

const DirectoryScreen = () => {
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [filteredSubstances, setFilteredSubstances] = useState<Substance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dangerousNumber: '',
    aggregationState: '',
    densityWater: '',
    densityAir: '',
    solubility: '',
    generalDanger: '',
    waterDanger: '',
  });

  useEffect(() => {
    fetchSubstances();
  }, []);

  useEffect(() => {
    filterSubstances();
  }, [searchQuery, filters, substances]);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (selectedSubstance) {
        const status = await isSubstanceBookmarked(selectedSubstance.oonNumber);
        setIsBookmarked(status);
      }
    };
    checkBookmarkStatus();
  }, [selectedSubstance]);

  const fetchSubstances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://10.138.134.152:8080/substances');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSubstances(data);
      setFilteredSubstances(data);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити список речовин');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubstances = () => {
    const filtered = substances.filter(substance => {
      // Базовий пошук
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const matchesSearch = searchTerms.every(term =>
        substance.name.toLowerCase().includes(term) ||
        substance.formula.toLowerCase().includes(term) ||
        substance.oonNumber.toString().includes(term) ||
        substance.dangerousNumber.toLowerCase().includes(term)
      );

      // Додаткові фільтри
      const matchesDangerousNumber = !filters.dangerousNumber || 
        substance.dangerousNumber.toLowerCase().includes(filters.dangerousNumber.toLowerCase());
      
      const matchesAggregationState = !filters.aggregationState || 
        substance.aggregationState.toLowerCase().includes(filters.aggregationState.toLowerCase());
      
      const matchesDensityWater = !filters.densityWater || 
        substance.densityWater.toLowerCase().includes(filters.densityWater.toLowerCase());
      
      const matchesDensityAir = !filters.densityAir || 
        substance.densityAir.toLowerCase().includes(filters.densityAir.toLowerCase());
      
      const matchesSolubility = !filters.solubility || 
        substance.solubility.toLowerCase().includes(filters.solubility.toLowerCase());
      
      const matchesGeneralDanger = !filters.generalDanger || 
        substance.generalDanger.toLowerCase().includes(filters.generalDanger.toLowerCase());
      
      const matchesWaterDanger = !filters.waterDanger || 
        substance.waterDanger.toLowerCase().includes(filters.waterDanger.toLowerCase());

      return matchesSearch && 
        matchesDangerousNumber && 
        matchesAggregationState && 
        matchesDensityWater && 
        matchesDensityAir && 
        matchesSolubility && 
        matchesGeneralDanger && 
        matchesWaterDanger;
    });
    
    setFilteredSubstances(filtered);
  };
  const handleBookmarkToggle = async () => {
    if (!selectedSubstance) return;
  
    try {
      if (isBookmarked) {
        await removeFromBookmarks(selectedSubstance.oonNumber);
        setIsBookmarked(false);
      } else {
        await addToBookmarks(selectedSubstance);
        setIsBookmarked(true);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося оновити закладки');
    }
  };
  const renderResultsModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
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
    onPress={handleBookmarkToggle}
  >
    {isBookmarked ? (
      <Bookmark size={24} color="#1a73e8" fill="#1a73e8" />
    ) : (
      <Bookmark size={24} color="#1a73e8" />
    )}
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
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Фільтри</Text>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Номер небезпеки:</Text>
              <TextInput
                style={styles.filterInput}
                value={filters.dangerousNumber}
                onChangeText={(text) => setFilters(prev => ({ ...prev, dangerousNumber: text }))}
                placeholder="Введіть номер небезпеки..."
              />
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Агрегатний стан:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.aggregationState}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, aggregationState: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(AggregationState).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Густина за водою:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.densityWater}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, densityWater: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(DensityWater).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Густина за повітрям:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.densityAir}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, densityAir: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(DensityAir).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Розчинність:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.solubility}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, solubility: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(Solubility).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Загальна небезпека:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.generalDanger}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, generalDanger: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(GeneralDanger).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>Небезпека при контакті з водою:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.waterDanger}
                  style={styles.picker}
                  onValueChange={(itemValue) => 
                    setFilters(prev => ({ ...prev, waterDanger: itemValue }))
                  }
                >
                  <Picker.Item label="Всі" value="" />
                  {Object.entries(WaterDanger).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            {/* ... buttons remain the same ... */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Пошук речовини..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.substancesContainer}>
          {filteredSubstances.map((substance) => (
            <TouchableOpacity
              key={`${substance.oonNumber}-${substance.name}`}
              style={styles.substanceCard}
              onPress={() => {
                setSelectedSubstance(substance);
                setModalVisible(true);
              }}
            >
              <Text style={styles.substanceName}>{substance.name}</Text>
              <Text style={styles.substanceFormula}>{substance.formula}</Text>
              <Text style={styles.substanceOon}>ООН: {substance.oonNumber}</Text>
              <Text style={styles.dangerousNumber}>Номер небезпеки: {substance.dangerousNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {renderResultsModal()}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  substancesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  substanceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  substanceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  substanceFormula: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  substanceOon: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  dangerousNumber: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
  infoCard: {
    marginBottom: 16,
  },
  filterButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterInputContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#1a73e8',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
  },
  picker: {
    height: 50,
    width: '100%',
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
});

export default DirectoryScreen;

            