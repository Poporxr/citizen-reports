import { Tabs } from "expo-router";
import BottomNavigation from "../../components/BottomNavigation";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNavigation {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="my-reports" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
