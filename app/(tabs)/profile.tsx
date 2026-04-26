import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCurrentUserProfile,
  type ProfileActionRow,
  type ProfilePreferenceRow,
  type ProfileSubscriptionRow,
  type ProfileUser,
} from "@/services/appwrite";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [actions, setActions] = useState<ProfileActionRow[]>([]);
  const [preferences, setPreferences] =
    useState<ProfilePreferenceRow | null>(null);
  const [subscription, setSubscription] =
    useState<ProfileSubscriptionRow | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);

    try {
      const profileData = await getCurrentUserProfile();

      setUser(profileData.user);
      setActions(profileData.actions);
      setPreferences(profileData.preferences);
      setSubscription(profileData.subscription);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const watched = actions.filter((i) => i.actionType === "watch");
  const saved = actions.filter((i) => i.actionType === "save");
  const favorites = actions.filter((i) => i.actionType === "favorite");
  const continueWatching = actions.filter(
    (i) => i.actionType === "continue"
  );

  const recent = [...actions]
    .sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() -
        new Date(a.$createdAt).getTime()
    )
    .slice(0, 10);

  const totalHours =
    watched.reduce((sum, item) => sum + (item.hours || 0), 0) || 0;

  const favoriteGenre =
    watched.length > 0 ? watched[0]?.genre || "Unknown" : null;
  const memberSince = user?.$createdAt
    ? new Date(user.$createdAt).getFullYear()
    : null;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#02020e] items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#02020e]">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="mt-4 bg-[#09091a] rounded-3xl p-5 border border-[#12142a]">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: user?.prefs?.avatar || "https://i.pravatar.cc/200",
              }}
              className="w-20 h-20 rounded-full"
            />

            <View className="ml-4 flex-1">
              <Text className="text-white text-2xl font-bold">
                {user?.name || "VIWE User"}
              </Text>

              <Text className="text-gray-400 mt-1">
                {user?.email || "No email available"}
              </Text>

              <Text className="text-gray-400 mt-1">
                {memberSince ? `Member since ${memberSince}` : "Member since unavailable"}
              </Text>

              <View className="mt-2 self-start px-3 py-1 rounded-full bg-[#10214F]">
                <Text className="text-cyan-300 text-xs font-semibold">
                  {subscription?.plan || "Free User"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* WATCHING STATS */}
        <Text className="text-white text-xl font-bold mt-6 mb-3">
          Watching Stats
        </Text>

        <View className="flex-row flex-wrap justify-between">
          <StatCard
            title="Movies Watched"
            value={
              watched.length > 0
                ? String(watched.length)
                : "No movies watched yet"
            }
          />

          <StatCard
            title="Hours Streamed"
            value={
              totalHours > 0
                ? `${totalHours}h`
                : "No hours streamed yet"
            }
          />

          <StatCard
            title="Saved"
            value={
              saved.length > 0 ? String(saved.length) : "No saved yet"
            }
          />

          <StatCard
            title="Favorites"
            value={
              favorites.length > 0
                ? String(favorites.length)
                : "No favorites yet"
            }
          />
        </View>

        <InfoBox
          title="Favorite Genre"
          value={favoriteGenre || "No favorite genre yet"}
        />

        {/* CONTINUE WATCHING */}
        <SectionTitle title="Continue Watching" />

        {continueWatching.length > 0 ? (
          continueWatching.map((movie) => (
            <MovieRow
              key={movie.$id}
              title={movie.movieTitle}
              image={movie.poster}
              subtitle={`${movie.timeLeft || "0 mins"} left`}
            />
          ))
        ) : (
          <EmptyText text="No continue watching yet" />
        )}

        {/* RECENTLY WATCHED */}
        <SectionTitle title="Recently Watched" />

        {recent.length > 0 ? (
          recent.map((movie) => (
            <MovieRow
              key={movie.$id}
              title={movie.movieTitle}
              image={movie.poster}
              subtitle={movie.actionType}
            />
          ))
        ) : (
          <EmptyText text="No recent activity yet" />
        )}

        {/* PREFERENCES */}
        <SectionTitle title="Preferences" />

        <SettingsRow
          title="Language"
          value={preferences?.language || "No language set yet"}
        />

        <SettingsRow
          title="Notifications"
          value={
            preferences?.notifications
              ? "Enabled"
              : "No notifications set yet"
          }
        />

        <SettingsRow
          title="Subtitles"
          value={preferences?.subtitles || "No subtitle preference yet"}
        />

        <SettingsRow
          title="Video Quality"
          value={preferences?.quality || "No quality preference yet"}
        />

        {/* ACCOUNT */}
        <SectionTitle title="Account Settings" />

        <SettingsRow title="Edit Profile" />
        <SettingsRow title="Change Password" />
        <SettingsRow title="Logout" />
        <SettingsRow title="Delete Account" danger />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: any) {
  return (
    <Text className="text-white text-xl font-bold mt-6 mb-3">
      {title}
    </Text>
  );
}

function EmptyText({ text }: any) {
  return (
    <View className="bg-[#09091a] rounded-2xl p-4 border border-[#12142a]">
      <Text className="text-gray-400">{text}</Text>
    </View>
  );
}

function MovieRow({ title, image, subtitle }: any) {
  return (
    <View className="bg-[#09091a] rounded-2xl p-4 mb-3 border border-[#12142a] flex-row items-center">
      <Image source={{ uri: image }} className="w-14 h-20 rounded-xl" />

      <View className="ml-4 flex-1">
        <Text className="text-white font-semibold" numberOfLines={1}>
          {title}
        </Text>

        <Text className="text-gray-400 mt-1 capitalize">{subtitle}</Text>
      </View>
    </View>
  );
}

function InfoBox({ title, value }: any) {
  return (
    <View className="mt-3 bg-[#09091a] rounded-2xl p-4 border border-[#12142a]">
      <Text className="text-gray-400 text-xs uppercase">{title}</Text>

      <Text className="text-white text-lg font-bold mt-2">{value}</Text>
    </View>
  );
}

function StatCard({ title, value }: any) {
  return (
    <View className="w-[48%] bg-[#09091a] rounded-2xl p-4 mb-3 border border-[#12142a]">
      <Text className="text-gray-400 text-xs uppercase">{title}</Text>

      <Text className="text-white text-sm font-bold mt-2">{value}</Text>
    </View>
  );
}

function SettingsRow({
  title,
  value,
  danger,
}: any) {
  return (
    <TouchableOpacity className="bg-[#09091a] rounded-2xl p-4 mb-3 border border-[#12142a] flex-row justify-between items-center">
      <Text
        className={`${danger ? "text-red-400" : "text-white"} font-medium`}
      >
        {title}
      </Text>

      {value && <Text className="text-gray-400">{value}</Text>}
    </TouchableOpacity>
  );
}