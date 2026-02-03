import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const COLORS = {
    primary: "#f47b25",
    bgDark: "#0d0d0d",
  };

  return (
    <View style={[styles.floatingNavContainer, { paddingBottom: insets.bottom + 8 }]}>
      {/* Tab Bar */}
      <BlurView intensity={100} tint="dark" style={[styles.tabBar, { backgroundColor: 'rgba(13,13,13,0.9)' }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Mapping Routes to Design Icons/Labels
          let iconName: any = 'home';
          let label = 'Home';

          if (route.name === 'Home') {
            iconName = 'home';
            label = 'Home';
          } else if (route.name === 'Events') {
            iconName = 'military-tech';
            label = 'Events';
          } else if (route.name === 'Scan') {
            iconName = 'qr-code-scanner';
            label = 'Scan';
          } else if (route.name === 'Wallet') {
            iconName = 'account-balance-wallet';
            label = 'Wallet';
          } else if (route.name === 'Profile') {
            iconName = 'person';
            label = 'Profile';
          }

          const color = isFocused ? COLORS.primary : 'rgba(255,255,255,0.4)';

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
            >
              <MaterialIcons name={iconName} size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: Dimensions.get('window').width - 32,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: 'bold'
  }
});
