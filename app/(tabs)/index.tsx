import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChevronDown } from 'lucide-react-native';

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
      content: 'Edit app/(tabs)/index.tsx to see changes. Press ' + 
        Platform.select({ ios: 'cmd + d', android: 'cmd + m' }) + 
        ' to open developer tools.',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },
    {
      id: 2,
      title: 'Як здійснювати пошук?',
      content: 'Tap the Explore tab to learn more about whats included in this starter app.',
      isCollapsed: true,
      rotation: new Animated.Value(0)
    },
    {
      id: 3,
      title: 'Як користуватись пошуком по зображенню?',
      content: 'When youre ready, run npm run reset-project to get a fresh app directory.',
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
    <ThemedView style={styles.container}>
      {sections.map((section, index) => (
        <ThemedView key={section.id} style={styles.sectionContainer}>
          <TouchableOpacity 
            onPress={() => toggleSection(index)}
            style={styles.touchable}
            activeOpacity={0.7}
          >
            <ThemedView style={styles.headerContainer}>
              <ThemedText type="subtitle" style={styles.headerText}>
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
                <ChevronDown size={24} color="#666" />
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
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007BFF',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  }
});