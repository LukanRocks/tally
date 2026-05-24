import { Tabs } from 'expo-router'
import { BookOpen, Home, PlusCircle, Settings, Wrench } from 'lucide-react-native'

const ACTIVE = '#0f172a'
const INACTIVE = '#94a3b8'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'log' }],
            })
          },
        })}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
