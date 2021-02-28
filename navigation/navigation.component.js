import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, SafeAreaView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../component/home.component";
import { SettingScreen } from "../component/settings.component";
import {
  BottomNavigation,
  BottomNavigationTab,
  Layout,
  Text,
  Icon,
} from "@ui-kitten/components";

const { Navigator, Screen } = createBottomTabNavigator();

const NavigationIcon = (props) => (
  <Icon {...props} name="navigation-2-outline" />
);

const SettingsIcon = (props) => <Icon {...props} name="settings-2-outline" />;

const BottomTabBar = ({ navigation, state }) => (
  <BottomNavigation
    style={styles.bottomTab}
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab icon={NavigationIcon} title="PILOT" />
    <BottomNavigationTab icon={SettingsIcon} title="SETTING" />
  </BottomNavigation>
);

const TabNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name="Home" component={HomeScreen} />
    <Screen name="Settings" component={SettingScreen} />
  </Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <TabNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  bottomTab: {},
});
