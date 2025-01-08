import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BookmarksScreen() {
  const [activeTab, setActiveTab] = useState('recently'); // 'recently' або 'bookmarks'

  const renderContent = () => {
    if (activeTab === 'recently') {
      return (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.placeholderText}>Недавно переглянуті</Text>
          {/* Тут буде список недавно переглянутих */}
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.placeholderText}>Закладки</Text>
          {/* Тут буде список закладок */}
        </ScrollView>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recently' && styles.activeTab]}
          onPress={() => setActiveTab('recently')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'recently' && styles.activeTabText
          ]}>
            Недавно переглянуті
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'bookmarks' && styles.activeTabText
          ]}>
            Закладки
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#1a73e8',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});