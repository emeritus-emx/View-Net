import { Tabs } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { icons } from "@/constants/icons";

type TabIconProps = {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
};

function TabIcon({ focused, icon, title }: TabIconProps) {
  return (
    <View
      className={`items-center justify-center rounded-[22px] border ${
        focused
          ? "border-[#243B86] bg-secondary"
          : "border-transparent bg-transparent"
      }`}
      style={focused ? styles.activeTab : styles.inactiveTab}
    >
      <View
        className={`items-center justify-center rounded-full ${
          focused ? "bg-[#0B1D52]" : "bg-[#050A1C]"
        }`}
        style={focused ? styles.activeIconWrap : styles.inactiveIconWrap}
      >
        <Image
          source={icon}
          tintColor={focused ? "#FFFFFF" : "#A8B5DB"}
          style={focused ? styles.activeIcon : styles.inactiveIcon}
        />
      </View>

      <Text
        className={`mt-2 text-xs font-semibold ${
          focused ? "text-white" : "text-light-200"
        }`}
      >
        {title}
      </Text>

      <View
        className={`mt-2 h-1 rounded-full ${
          focused ? "bg-[#D6C7FF]" : "bg-transparent"
        }`}
        style={styles.indicator}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
        },
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />

      <Tabs.Screen
        name="save"
        options={{
          title: "Save",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Save" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 82,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "#02020e",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#101A3E",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  activeTab: {
    minWidth: 82,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inactiveTab: {
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  activeIconWrap: {
    width: 40,
    height: 40,
  },
  inactiveIconWrap: {
    width: 36,
    height: 36,
  },
  activeIcon: {
    width: 20,
    height: 20,
  },
  inactiveIcon: {
    width: 18,
    height: 18,
  },
  indicator: {
    width: 24,
  },
});
