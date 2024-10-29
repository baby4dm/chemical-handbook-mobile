import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform, Animated, Image, SafeAreaView, StatusBar, Dimensions, ScrollView } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const FONT_SCALE = width / 400; // Base scale factor for fonts

interface Section {
  id: number;
  title: string;
  content: string;
  isCollapsed: boolean;
  rotation: Animated.Value;
}

export default function HomeScreen() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      title: 'Для чого призначений додаток?',
      content: 
        'Збільшення імпорту та експорту товарів, включаючи значну кількість небезпечних речовин, ' +
        'вимагає комплексної інформації для запобігання та реагування на аварії та надзвичайні ситуації, ' +
        'які можуть виникнути під час їх зберігання та транспортування.\n\n' +
        'Цей додаток створений для забезпечення як фахівців, так і широкого кола користувачів ' +
        'швидкою та точною інформацією про небезпечні речовини різного походження.\n\n' +
        'У додатку ви можете легко шукати речовини за кодами небезпечних вантажів (HAZMAT), ' +
        'IMDG-кодами, номерами ООН, формулами, назвами, а також сканувати застережні таблички, ' +
        'щоб отримати детальну інформацію про конкретні речовини.\n\n' +
        'Всі необхідні дані подані в зрозумілій формі, щоб допомогти вам приймати швидкі та обґрунтовані рішення ' +
        'щодо безпеки, включаючи інформацію про загальну пожежну небезпеку, ризики для здоров\'я ' +
        'та вплив на навколишнє середовище. Довідник містить найважливішу інформацію про небезпечні ' +
        'речовини та товари, що дозволяє вам бути завжди поінформованим.',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },
    {
      id: 2,
      title: 'Як здійснювати пошук?',
      content: 'Перейшовши на вкладку пошук, ви можете швидко здійснити необхідні дії, ввівши назву речовини, HAZ, IMDG код, ОНН номер чи формулу.',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },
    {
      id: 3,
      title: 'Як користуватись пошуком по зображенню?',
      content: 'Для пошуку речовини по зображенню застережної таблички здійсніть наступні кроки: \n 1.Прейдіть у вкладку "Сканувати" \n 2.Наведіть камеру телефону на застережну табличку та натисніть "Сканувати" \n 3.Дочекайтесь обробки зображення та надішліть його \n 4.Зачекайте на отримання результату \n\nВаживливою умовою є відсутність сторонніх символів на зображені, для цього застережна табличка повинна бути розміщена в зоні сканування, що позначена червоною лінією.',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },
    {
      id: 4,
      title: 'Дані про речовини',
      content: `  Агрегатний стан:
        - Газоподібний
        - Рідкий
        - Твердий
        - Перехідний (якщо температура топлення близька до 20 °C)
    
        Густина за повітрям:
        - Легша за повітря
        - Однакова з повітрям
        - Важча за повітря
    
        Ці дані дають інформацію про густину газу чи пари відносно повітря.
    
        Густина за водою:
        - Легша води
        - Однакова з водою
        - Важча за воду
    
        Ці дані дають інформацію про густину речовини відносно води.
    
        Розчинність у воді:
        - Водорозчинна: речовини, що змішуються з водою
        - Частково розчинна: речовини, які розчиняються частково або тільки через певний проміжок часу
        - Нерозчинна: речовини, які не розчиняються у воді
    
        Загальна небезпека:
        - Горюча: речовини, горючі за нормальних умов
        - Вибухонебезпечна: речовини, які здатні вибухати, такі як вибухівки та горючі гази (температура спалаху нижче 21 °C)
        - Радіоактивна: речовини, які є джерелом іонізуючого випромінювання
    
        Небезпека при контакті з водою:
        - Обережно з водою: речовини, які можуть викликати небезпечні наслідки при контакті з водою (наприклад, виділення тепла, розбризкування кислот)
        - Увага! Ніякої води: речовини, які небезпечно реагують при контакті з водою (вивільняються отрути, займисті речовини)
    
        Небезпека для здоров'я:
        - Отруйна: речовини, які можуть викликати гостре чи хронічне отруєння або смерть
        - Подразнююча: речовини, які можуть викликати запалення при контакті зі шкірою
        - Шкідлива для здоров’я: речовини, які можуть викликати ушкодження здоров'я
        - Проникна: речовини, які можуть проникати в організм через шкіру
      `,
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },       
    {
      id: 5,
      title: 'Зворотній зв\'язок',
      content: 'Надсилайте всі скарги, побажання та пропозиції на електронну пошту! \n 📧babych.dmtr@gmail.com',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    }
  ]);

  const toggleSection = (index: number): void => {
    setSections(sections.map((section, i) => {
      if (i === index) {
        Animated.timing(section.rotation, {
          toValue: section.isCollapsed ? 1 : 0,
          duration: 300,
          useNativeDriver: true
        }).start();
        return { ...section, isCollapsed: !section.isCollapsed };
      }
      return section;
    }));
  };

  return (
      <ThemedView style={styles.mainContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {sections.map((section, index) => (
            <Animated.View 
              key={section.id} 
              style={[
                styles.sectionContainer,
                { 
                  transform: [{
                    scale: section.isCollapsed ? 1 : 0.98
                  }]
                }
              ]}
            >
              <TouchableOpacity 
                onPress={() => toggleSection(index)}
                style={styles.touchable}
                activeOpacity={0.7}
              >
                <ThemedView style={styles.questionContainer}>
                  <ThemedText style={styles.questionText}>
                    {section.title}
                  </ThemedText>
                  <Animated.View style={{
                    transform: [{
                      rotate: section.rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg']
                      })
                    }]
                  }}>
                    <ChevronDown size={24} color="#1a73e8" />
                  </Animated.View>
                </ThemedView>
              </TouchableOpacity>
              
              <Collapsible collapsed={section.isCollapsed}>
                <ThemedView style={styles.contentContainer}>
                  <ThemedText style={styles.contentText}>
                    {section.content}
                  </ThemedText>
                </ThemedView>
              </Collapsible>
            </Animated.View>
          ))}
        </ScrollView>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  questionText: {
    flex: 1,
    fontSize: Math.min(15 * FONT_SCALE, 16),
    fontWeight: '600',
    color: '#1a73e8',
    marginRight: 16,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#fff',
    width: '100%',
    flex: 1,
  },
  contentText: {
    fontSize: Math.min(14 * FONT_SCALE, 15),
    lineHeight: 24,
    color: '#5f6368',
    letterSpacing: 0.2,
    flexWrap: 'wrap', // Дозволяє переносити текст
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
});