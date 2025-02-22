import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#151718',
        tabBarLabelStyle: {
          fontSize: 10,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Пошук',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'search' : 'search-outline'}
              color={focused ? '#1a73e8' : '#151718'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          title: 'Сканувати',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'camera' : 'camera-outline'}
              color={focused ? '#1a73e8' : '#151718'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="directory"
        options={{
          title: 'Довідник',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'book' : 'book-outline'}
              color={focused ? '#1a73e8' : '#151718'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Закладки',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'bookmark' : 'bookmark-outline'}
              color={focused ? '#1a73e8' : '#151718'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Інфо',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={focused ? '#1a73e8' : '#151718'}
            />
          ),
        }}
      />
    </Tabs>
  );
}