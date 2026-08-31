import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAuth } from "../state/AuthContext";
import { TabBar } from "./TabBar";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { DiscoverScreen } from "../screens/DiscoverScreen";
import { EventsScreen } from "../screens/EventsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EditorScreen } from "../screens/EditorScreen";
import { CopaScreen } from "../screens/CopaScreen";
import { CreateSheetScreen } from "../screens/CreateSheetScreen";
import { AddSongScreen } from "../screens/AddSongScreen";
import { LastfmScreen } from "../screens/LastfmScreen";
import { Global100Screen } from "../screens/Global100Screen";
import { SearchScreen } from "../screens/SearchScreen";
import { MusicDetailScreen } from "../screens/MusicDetailScreen";
import { AlbumDetailScreen } from "../screens/AlbumDetailScreen";
import { ArtistDetailScreen } from "../screens/ArtistDetailScreen";
import { UserDetailScreen } from "../screens/UserDetailScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { PushSubmitScreen } from "../screens/PushSubmitScreen";
import { PushRankScreen } from "../screens/PushRankScreen";
import { ClubeScreen } from "../screens/ClubeScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { RecommendSongScreen } from "../screens/RecommendSongScreen";
import { WriteReviewScreen } from "../screens/WriteReviewScreen";
import { ChartDetailScreen } from "../screens/ChartDetailScreen";
import { SpotlightsScreen } from "../screens/SpotlightsScreen";
import { ParadaWeekPickerSheet } from "../components/ParadaWeekPickerSheet";

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Cadastro: undefined;
  Main: undefined;
  Editor: undefined;
  Copa: undefined;
  CreateSheet: undefined;
  AddSong: undefined;
  Lastfm: undefined;
  Global100: undefined;
  Search: undefined;
  MusicDetail: { songId?: string; spotifyId?: string } | undefined;
  AlbumDetail: { albumId?: number };
  ArtistDetail: { artistId?: number };
  UserDetail: { handle: string } | undefined;
  Notifications: undefined;
  Settings: undefined;
  PushSubmit: undefined;
  PushRank: undefined;
  Clube: undefined;
  EditProfile: undefined;
  RecommendSong: undefined;
  WriteReview: { albumId?: number; title?: string; artist?: string; coverUrl?: string | null } | undefined;
  ChartDetail: { chartId: string };
  Spotlights: undefined;
  ParadaWeekPicker: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
  Events: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function Blank() {
  return null;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
      screenListeners={({ navigation }) => ({
        tabPress: (e) => {
          if (e.target?.includes("Create")) {
            e.preventDefault();
            navigation.getParent()?.navigate("CreateSheet");
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Create" component={Blank} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { colors } = useAppTheme();
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isSignedIn ? "signed-in" : "signed-out"}
        screenOptions={{ headerShown: false }}
        initialRouteName={isSignedIn ? "Main" : "Onboarding"}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Copa" component={CopaScreen} />
        <Stack.Screen name="Lastfm" component={LastfmScreen} />
        <Stack.Screen name="Global100" component={Global100Screen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="MusicDetail" component={MusicDetailScreen} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="PushSubmit" component={PushSubmitScreen} />
        <Stack.Screen name="PushRank" component={PushRankScreen} />
        <Stack.Screen name="Clube" component={ClubeScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChartDetail" component={ChartDetailScreen} />
        <Stack.Screen name="Spotlights" component={SpotlightsScreen} />
        <Stack.Screen
          name="CreateSheet"
          component={CreateSheetScreen}
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="AddSong"
          component={AddSongScreen}
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="RecommendSong"
          component={RecommendSongScreen}
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="WriteReview"
          component={WriteReviewScreen}
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="ParadaWeekPicker"
          component={ParadaWeekPickerSheet}
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
