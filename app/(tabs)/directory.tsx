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
  NativeSyntheticEvent,
  NativeScrollEvent,
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

interface SearchParams {
  [key: string]: string;
}

const ITEMS_PER_PAGE = 5;

const DirectoryScreen = () => {
  // Основні стейти
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Стейти для пагінації
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Стейти для модальних вікон
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    aggregationState: '',
    densityWater: '',
    densityAir: '',
    solubility: '',
    generalDanger: '',
    waterDanger: '',
  });

  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  // Початкове завантаження даних
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const params: SearchParams = {
          page: '0',
          limit: String(ITEMS_PER_PAGE)
        };
        
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`http://10.138.134.81:8080/substances/search?${queryParams}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setSubstances(data.content);
        setHasMore(!data.last);
      } catch (error) {
        console.error('Error loading initial data:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити список речовин');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Оновлення при зміні фільтрів
  useEffect(() => {
    const fetchWithFilters = async () => {
      try {
        setIsLoading(true);
        setPage(0);
        
        const params: SearchParams = {
          page: '0',
          limit: String(ITEMS_PER_PAGE)
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (filters.aggregationState) params.aggregationState = filters.aggregationState;
        if (filters.densityWater) params.densityWater = filters.densityWater;
        if (filters.densityAir) params.densityAir = filters.densityAir;
        if (filters.solubility) params.solubility = filters.solubility;
        if (filters.generalDanger) params.generalDanger = filters.generalDanger;
        if (filters.waterDanger) params.waterDanger = filters.waterDanger;

        const queryParams = new URLSearchParams(params);
        const response = await fetch(`http://10.138.134.81:8080/substances/search?${queryParams}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setSubstances(data.content);
        setHasMore(!data.last);
      } catch (error) {
        console.error('Error updating filters:', error);
        Alert.alert('Помилка', 'Не вдалося оновити фільтри');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithFilters();
  }, [filters]);

  // Завантаження наступної сторінки
  useEffect(() => {
    const loadNextPage = async () => {
      if (page > 0) {
        try {
          setIsLoadingMore(true);
          
          const params: SearchParams = {
            page: String(page),
            limit: String(ITEMS_PER_PAGE)
          };

          if (searchQuery.trim()) {
            params.search = searchQuery.trim();
          }

          if (filters.aggregationState) params.aggregationState = filters.aggregationState;
          if (filters.densityWater) params.densityWater = filters.densityWater;
          if (filters.densityAir) params.densityAir = filters.densityAir;
          if (filters.solubility) params.solubility = filters.solubility;
          if (filters.generalDanger) params.generalDanger = filters.generalDanger;
          if (filters.waterDanger) params.waterDanger = filters.waterDanger;

          const queryParams = new URLSearchParams(params);
          const response = await fetch(`http://10.138.134.81:8080/substances/search?${queryParams}`);
          
          if (!response.ok) throw new Error('Network response was not ok');
          
          const data = await response.json();
          setSubstances(prev => [...prev, ...data.content]);
          setHasMore(!data.last);
        } catch (error) {
          console.error('Error loading more:', error);
          Alert.alert('Помилка', 'Не вдалося завантажити більше даних');
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    loadNextPage();
  }, [page]);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (selectedSubstance) {
        const status = await isSubstanceBookmarked(selectedSubstance.oonNumber);
        setIsBookmarked(status);
      }
    };
    checkBookmarkStatus();
  }, [selectedSubstance]);

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return 'Не вказано';
    return String(value);
  };

  const handleSearch = async () => {
    if (internalSearchQuery.trim() !== '') {
      setSearchQuery(internalSearchQuery.trim());
      setPage(0);
      setSubstances([]);
      setHasMore(true);
      
      try {
        setIsLoading(true);
        
        const params: SearchParams = {
          page: '0',
          limit: String(ITEMS_PER_PAGE),
          search: internalSearchQuery.trim()
        };

        // Додаємо активні фільтри
        if (filters.aggregationState) params.aggregationState = filters.aggregationState;
        if (filters.densityWater) params.densityWater = filters.densityWater;
        if (filters.densityAir) params.densityAir = filters.densityAir;
        if (filters.solubility) params.solubility = filters.solubility;
        if (filters.generalDanger) params.generalDanger = filters.generalDanger;
        if (filters.waterDanger) params.waterDanger = filters.waterDanger;

        const queryParams = new URLSearchParams(params);
        
        console.log('Search URL:', `http://10.138.134.81:8080/substances/search?${queryParams}`);

        const response = await fetch(`http://10.138.134.81:8080/substances/search?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Результати пошуку:', data);
        
        setSubstances(data.content);
        setHasMore(!data.last);
        
      } catch (error) {
        console.error('Помилка пошуку:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити список речовин');
      } finally {
        setIsLoading(false);
      }
    }
  };
  

    const fetchSubstances = async (loadMore = false) => {
      if (!loadMore) {
        setIsLoading(true);
      }
      
      try {
        const params: SearchParams = {
          page: String(page),
          limit: String(ITEMS_PER_PAGE)
        };
    
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
    
        if (filters.aggregationState) params.aggregationState = filters.aggregationState;
        if (filters.densityWater) params.densityWater = filters.densityWater;
        if (filters.densityAir) params.densityAir = filters.densityAir;
        if (filters.solubility) params.solubility = filters.solubility;
        if (filters.generalDanger) params.generalDanger = filters.generalDanger;
        if (filters.waterDanger) params.waterDanger = filters.waterDanger;
    
        const queryParams = new URLSearchParams(params);
    
        const response = await fetch(`http://10.138.134.81:8080/substances/search?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        setSubstances(prev => loadMore ? [...prev, ...data.content] : data.content);
        setHasMore(!data.last);
        
      } catch (error) {
        console.error('Помилка пошуку:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити список речовин');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

  const loadMore = () => {
    if (isLoadingMore || !hasMore) {
      console.log('Пропуск завантаження:', { isLoadingMore, hasMore });
      return;
    }
    
    console.log('Завантаження наступної сторінки...');
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Розрахуємо відстань до кінця
    const paddingToBottom = 50; // збільшимо відступ для раннього тригера
    const currentScrollPosition = layoutMeasurement.height + contentOffset.y;
    const scrollContentSize = contentSize.height;
    
    // Перевіримо, чи ми досягли кінця з урахуванням відступу
    if (currentScrollPosition + paddingToBottom >= scrollContentSize) {
      if (!isLoadingMore && hasMore) {
        loadMore();
      }
    }
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

  const handleFilterApply = () => {
    setFilterModalVisible(false);
    setPage(0);
    setSubstances([]);
    setHasMore(true);
    fetchSubstances();
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderSubstancesList = () => {
    if (!substances.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Речовини не знайдено</Text>
        </View>
      );
    }
  
    return substances.map((substance, index) => (
      <TouchableOpacity
        // Використовуємо індекс для забезпечення унікальності
        key={`${substance.oonNumber}-${substance.name}-${index}`}
        // або можна використати більш складний ключ
        // key={`${substance.oonNumber}-${substance.name}-${substance.formula || ''}-${index}`}
        style={styles.substanceCard}
        onPress={() => {
          setSelectedSubstance(substance);
          setModalVisible(true);
        }}
      >
        <Text style={styles.substanceName}>
          {safeString(substance.name)}
        </Text>
        <Text style={styles.substanceFormula}>
          {safeString(substance.formula)}
        </Text>
        <Text style={styles.substanceOon}>
          <Text>ООН: </Text>
          <Text>{safeString(substance.oonNumber)}</Text>
        </Text>
        <Text style={styles.dangerousNumber}>
          <Text>Номер небезпеки: </Text>
          <Text>{safeString(substance.dangerousNumber)}</Text>
        </Text>
      </TouchableOpacity>
    ));
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

  const SearchComponent = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Пошук речовини..."
        value={internalSearchQuery}
        onChangeText={setInternalSearchQuery}
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Search size={20} color="#666" />
      </TouchableOpacity>
    </View>
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
              <Text style={styles.filterLabel}>Агрегатний стан:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.aggregationState}
                  style={styles.picker}
                >
                  <Picker.Item label="Агрегатний стан" value="" />
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
                >
                  <Picker.Item label="Густина за водою" value="" />
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
                >
                  <Picker.Item label="Густина за повітрям" value="" />
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
                >
                  <Picker.Item label="Розчинність" value="" />
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
                >
                  <Picker.Item label="Загальна небезпека" value="" />
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
                >
                  <Picker.Item label="Небезпека при контакті з водою" value="" />
                  {Object.entries(WaterDanger).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
  
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={handleFilterApply}
              >
                <Text style={styles.filterButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
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
          <TextInput
            style={styles.searchInput}
            placeholder="Пошук речовини..."
            value={internalSearchQuery}
            onChangeText={setInternalSearchQuery}
            // onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
  style={styles.searchButton}
  onPress={handleSearch}
>
  <Search size={20} color="#666" />
</TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        onScroll={handleScroll}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.substancesContainer}>
          {renderSubstancesList()}
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#1a73e8" />
            </View>
          )}
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
  searchIcon: {
    marginRight: 8,
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
  resetButton: {
    backgroundColor: '#dc3545',
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
  loadingMoreContainer: {
    padding: 16,
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
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 8,
  },
  searchButton: {
    padding: 8,
  },
  filterButtonsContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DirectoryScreen;

            