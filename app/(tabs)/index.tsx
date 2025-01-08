import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  ScrollView, 
  Linking,
  TextInput,
  Alert,
  Platform,
  View,
  KeyboardAvoidingView
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChevronDown, Send, Mail, User, FileText } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const FONT_SCALE = width / 400;
const ANIMATION_DURATION = 300;
const FEEDBACK_EMAIL = 'babych.dmtr@gmail.com';

interface Section {
  id: number;
  title: string;
  content: string | React.ReactNode;
  isCollapsed: boolean;
  rotation: Animated.Value;  // залишаємо це
  contentHeight: Animated.Value;
}

interface FeedbackFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const FeedbackForm = () => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: keyof FeedbackFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push("Введіть ваше ім'я");
    }

    if (!formData.email.trim()) {
      errors.push('Введіть вашу email адресу');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Введіть коректну email адресу');
    }

    if (!formData.message.trim()) {
      errors.push('Введіть текст повідомлення');
    }

    return errors;
  };

  const handleSendFeedback = async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      Alert.alert('Помилка', errors.join('\n'));
      return;
    }

    try {
      const subject = encodeURIComponent(formData.subject || 'Зворотній зв\'язок з додатку');
      const body = encodeURIComponent(
        `Від: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      );
      const mailtoUrl = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        throw new Error('Не вдалося відкрити поштовий клієнт');
      }
      
      await Linking.openURL(mailtoUrl);
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      Alert.alert('Успішно', 'Ваше повідомлення буде відправлено через поштовий клієнт');
    } catch (error) {
      Alert.alert(
        'Помилка',
        'Не вдалося відкрити поштовий клієнт. Будь ласка, перевірте налаштування пошти на вашому пристрої.'
      );
    }
  };

  const renderInputWithIcon = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (value: string) => void,
    multiline: boolean = false
  ) => (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon}>
        {icon}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.feedbackContainer}
    >
      <ThemedText style={[styles.contentText, styles.feedbackSubtitle]}>
        Заповніть форму, щоб надіслати нам ваші побажання, пропозиції чи повідомлення про помилки:
      </ThemedText>

      {renderInputWithIcon(
        <User size={20} color="#666" />,
        "Ваше ім'я",
        formData.name,
        handleInputChange('name')
      )}

      {renderInputWithIcon(
        <Mail size={20} color="#666" />,
        'Ваш email',
        formData.email,
        handleInputChange('email')
      )}

      {renderInputWithIcon(
        <FileText size={20} color="#666" />,
        'Тема повідомлення (необов\'язково)',
        formData.subject,
        handleInputChange('subject')
      )}

      {renderInputWithIcon(
        <FileText size={20} color="#666" />,
        'Текст повідомлення',
        formData.message,
        handleInputChange('message'),
        true
      )}

      <TouchableOpacity 
        style={styles.sendButton}
        onPress={handleSendFeedback}
        activeOpacity={0.7}
      >
        <Send size={20} color="#fff" style={styles.sendIcon} />
        <ThemedText style={styles.sendButtonText}>
          Надіслати
        </ThemedText>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

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
      rotation: new Animated.Value(0),
      contentHeight: new Animated.Value(0)
    },
    {
      id: 2,
      title: 'Як здійснювати пошук?',
      content: 'Перейшовши на вкладку пошук, ви можете швидко здійснити необхідні дії, ввівши назву речовини, HAZ, IMDG код, ОНН номер чи формулу.',
      isCollapsed: true,
      rotation: new Animated.Value(0),
      contentHeight: new Animated.Value(0)
    },
    {
      id: 3,
      title: 'Як користуватись пошуком по зображенню?',
      content: 'Для пошуку речовини по зображенню застережної таблички здійсніть наступні кроки: \n\n' +
               '1. Прейдіть у вкладку "Сканувати" \n' +
               '2. Наведіть камеру телефону на застережну табличку та натисніть "Сканувати" \n' +
               '3. Дочекайтесь обробки зображення та надішліть його \n' +
               '4. Зачекайте на отримання результату \n\n' +
               'Важливою умовою є відсутність сторонніх символів на зображені, для цього застережна табличка повинна бути розміщена в зоні сканування, що позначена червоною лінією.',
      isCollapsed: true,
      rotation: new Animated.Value(0),
      contentHeight: new Animated.Value(0)
    },
    {
      id: 4,
      title: 'Дані про речовини',
      content: `Агрегатний стан:
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
        - Шкідлива для здоров'я: речовини, які можуть викликати ушкодження здоров'я
        - Проникна: речовини, які можуть проникати в організм через шкіру`,
      isCollapsed: true,
      rotation: new Animated.Value(0),
      contentHeight: new Animated.Value(0)
    },
    {
      id: 5,
      title: 'Зворотній зв\'язок',
      content: <FeedbackForm />,
      isCollapsed: true,
      rotation: new Animated.Value(0),
      contentHeight: new Animated.Value(0)
    }
  ]);

  const toggleSection = (index: number): void => {
    setSections(sections.map((section, i) => {
      if (i === index) {
        // Використовуємо spring для більш плавної анімації
        Animated.spring(section.rotation, {
          toValue: section.isCollapsed ? 1 : 0,
          useNativeDriver: true,
          friction: 8,
          tension: 20
        }).start();
  
        // Анімація для висоти контенту залишається як є
        Animated.timing(section.contentHeight, {
          toValue: section.isCollapsed ? 1 : 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false
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
                <Animated.View style={[{
  transform: [{
    rotateX: section.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    })
  }]
}]}>
  <ChevronDown size={24} color="#1a73e8" />
</Animated.View>
              </ThemedView>
            </TouchableOpacity>
            
            <Collapsible 
              collapsed={section.isCollapsed}
              enablePointerEvents={true}
              duration={ANIMATION_DURATION}
              renderChildrenCollapsed={false}
            >
              <Animated.View style={[
                styles.contentContainer,
                {
                  opacity: section.contentHeight.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.8, 1]
                  })
                }
              ]}>
                {typeof section.content === 'string' ? (
                  <ThemedText style={styles.contentText}>
                    {section.content}
                  </ThemedText>
                ) : (
                  section.content
                )}
              </Animated.View>
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
  },
  contentText: {
    fontSize: Math.min(14 * FONT_SCALE, 15),
    lineHeight: 24,
    color: '#5f6368',
    letterSpacing: 0.2,
    flexWrap: 'wrap',
    width: '100%',
  },
  feedbackContainer: {
    width: '100%',
    padding: 16,
  },
  feedbackSubtitle: {
    marginBottom: 20,
    color: '#666',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: Math.min(14 * FONT_SCALE, 15),
    color: '#5f6368',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: Math.min(14 * FONT_SCALE, 15),
    fontWeight: '600',
  },
  touchable: {
    width: '100%',
  },
});