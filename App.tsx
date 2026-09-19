import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CRMProvider, useCRM } from './context/CRMContext';
import { ChatsScreen } from './screens/ChatsScreen';
import { ChatDetailScreen } from './screens/ChatDetailScreen';
import { ChatHeaderTitle } from './components/ChatHeaderTitle';
import { PipelineScreen } from './screens/PipelineScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { ContactDetailScreen } from './screens/ContactDetailScreen';
import { FollowUpsScreen } from './screens/FollowUpsScreen';
import { HubScreen } from './screens/HubScreen';
import { NewContactModal } from './screens/NewContactModal';
import { NewFollowUpModal } from './screens/NewFollowUpModal';
import { PricingPlansModal } from './screens/PricingPlansModal';
import { TemplateEditorModal } from './screens/TemplateEditorModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Header Right Button with Pricing Plan Pill
const HeaderRightSubscription = ({ navigation }: { navigation: any }) => {
  const { subscription } = useCRM();

  return (
    <TouchableOpacity
      style={styles.headerPlanPill}
      onPress={() => navigation.navigate('PricingPlansModal')}
      activeOpacity={0.8}
    >
      <Ionicons name="sparkles" size={12} color="#075E54" style={{ marginRight: 3 }} />
      <Text style={styles.headerPlanText}>
        {subscription.tier.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

// Bottom Tabs Navigator
function MainTabs() {
  const { contacts, followUps } = useCRM();
  const unreadChatsCount = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const pendingFollowUpsCount = followUps.filter((f) => !f.completed && f.dueDate === '2026-09-19').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#075E54',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        tabBarActiveTintColor: '#25D366',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatsScreen}
        options={({ navigation }) => ({
          title: 'WhatsApp CRM',
          tabBarLabel: 'Chats',
          tabBarBadge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#25D366', color: '#FFFFFF', fontWeight: '800' },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          headerRight: () => <HeaderRightSubscription navigation={navigation} />,
        })}
      />

      <Tab.Screen
        name="PipelineTab"
        component={PipelineScreen}
        options={({ navigation }) => ({
          title: 'Sales Pipeline',
          tabBarLabel: 'Pipeline',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network" size={size} color={color} />
          ),
          headerRight: () => <HeaderRightSubscription navigation={navigation} />,
        })}
      />

      <Tab.Screen
        name="ContactsTab"
        component={ContactsScreen}
        options={({ navigation }) => ({
          title: 'Customer Records',
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerRight: () => <HeaderRightSubscription navigation={navigation} />,
        })}
      />

      <Tab.Screen
        name="FollowUpsTab"
        component={FollowUpsScreen}
        options={({ navigation }) => ({
          title: 'Follow-Ups & Tasks',
          tabBarLabel: 'Follow-ups',
          tabBarBadge: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: '800' },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alarm" size={size} color={color} />
          ),
          headerRight: () => <HeaderRightSubscription navigation={navigation} />,
        })}
      />

      <Tab.Screen
        name="HubTab"
        component={HubScreen}
        options={({ navigation }) => ({
          title: 'Business Hub',
          tabBarLabel: 'Hub',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          headerRight: () => <HeaderRightSubscription navigation={navigation} />,
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CRMProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
              options={({ route, navigation }) => {
                const contactId = (route.params as any)?.contactId;
                return {
                  headerStyle: {
                    backgroundColor: '#075E54',
                  },
                  headerTintColor: '#FFFFFF',
                  headerTitle: () => <ChatHeaderTitle contactId={contactId} />,
                  headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginRight: 4 }}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ContactDetail', { contactId })}
                      >
                        <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ),
                };
              }}
            />

            <Stack.Screen
              name="ContactDetail"
              component={ContactDetailScreen}
              options={{
                title: 'Customer Dossier',
                headerStyle: { backgroundColor: '#075E54' },
                headerTintColor: '#FFFFFF',
              }}
            />

            {/* Modals */}
            <Stack.Screen
              name="NewContactModal"
              component={NewContactModal}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="NewFollowUpModal"
              component={NewFollowUpModal}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="PricingPlansModal"
              component={PricingPlansModal}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="TemplateEditorModal"
              component={TemplateEditorModal}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CRMProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 12,
  },
  headerPlanText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#075E54',
  },
  chatHeaderTitleContainer: {
    alignItems: 'flex-start',
  },
  chatHeaderName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  chatHeaderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
    marginRight: 4,
  },
  chatHeaderStatus: {
    color: '#D1FAE5',
    fontSize: 10.5,
  },
});
