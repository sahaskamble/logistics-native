import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import {
  Camera,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ChevronRight,
  Building2,
  CreditCard,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRootAuth } from "@/context/RootAuthCtx";

type UserRecord = {
  id: string;
  email?: string;
  role?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  phone?: number | string;
  avatar?: string;
};

type UserProfileRecord = {
  id: string;
  user?: string;
  address?: string;
  businessName?: string;
  contact?: string;
  gstIn?: string;
  panNo?: string;
};

function InfoRow({
  icon: IconComponent,
  label,
  value,
  editable,
  inputValue,
  onInputChange,
  placeholder,
  ...inputProps
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editable?: boolean;
  inputValue?: string;
  onInputChange?: (text: string) => void;
  placeholder?: string;
  [key: string]: unknown;
}) {
  return (
    <View className="flex-row items-center py-4 border-b border-gray-200 last:border-b-0">
      <View className="w-10 items-center justify-center">
        <Icon as={IconComponent} size={20} className="text-gray-400" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-xs text-gray-500 mb-0.5">{label}</Text>
        {editable && onInputChange !== undefined ? (
          <Input
            value={inputValue}
            onChangeText={onInputChange}
            placeholder={placeholder}
            className="border-0 p-0 h-auto min-h-0 shadow-none text-base font-medium text-foreground"
            {...inputProps}
          />
        ) : (
          <Text className="text-base font-medium text-foreground">{value || "—"}</Text>
        )}
      </View>
    </View>
  );
}

function getInitials(user: UserRecord | null): string {
  if (!user) return "?";
  const name = user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "?";
}

function formatPhone(phone: number | string | undefined): string {
  if (phone == null) return "";
  const s = String(phone);
  if (s.startsWith("+")) return s;
  if (s.length === 10) return `+91 ${s}`;
  return s;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);
  const { Logout } = useRootAuth();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    name: "",
    phone: "",
    address: "",
    businessName: "",
    contact: "",
    gstIn: "",
    panNo: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser.isValid || !currentUser.user?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const userData = await pb.collection("users").getOne<UserRecord>(currentUser.user.id);
      setUser(userData);

      try {
        const profileData = await pb.collection("user_profile").getFirstListItem<UserProfileRecord>(
          `user="${currentUser.user.id}"`
        );
        setUserProfile(profileData as UserProfileRecord);
        setFormData({
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          name: userData.name || "",
          phone: userData.phone?.toString() || "",
          address: profileData.address || "",
          businessName: profileData.businessName || "",
          contact: profileData.contact || "",
          gstIn: profileData.gstIn || "",
          panNo: profileData.panNo || "",
        });
      } catch (error: any) {
        if (error?.status === 404) {
          try {
            const newProfile = await pb.collection("user_profile").create<UserProfileRecord>({
              user: currentUser.user.id,
            });
            setUserProfile(newProfile as UserProfileRecord);
          } catch (createError) {
            console.error("Error creating user profile:", createError);
          }
        }
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      Alert.alert("Error", "Failed to load profile data.");
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const requestImagePickerPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need camera roll permissions to update your profile picture.");
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fd = new FormData();
        // @ts-ignore
        fd.append("avatar", {
          uri: asset.uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });

        setSaving(true);
        await pb.collection("users").update(user!.id, fd);
        const updatedUser = await pb.collection("users").getOne<UserRecord>(user!.id);
        setUser(updatedUser);
        Alert.alert("Success", "Profile picture updated successfully!");
        setSaving(false);
      }
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      Alert.alert("Error", error.message || "Failed to update profile picture.");
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentUser = getCurrentUser();
      if (!currentUser.isValid || !currentUser.user?.id) {
        Alert.alert("Error", "User not authenticated.");
        setSaving(false);
        return;
      }

      const nameParts = (formData.name || "").trim().split(/\s+/).filter(Boolean);
      await pb.collection("users").update(currentUser.user.id, {
        firstname: nameParts[0] || formData.firstname || undefined,
        lastname: nameParts.length > 1 ? nameParts.slice(1).join(" ") : formData.lastname || undefined,
        name: formData.name?.trim() || undefined,
        phone: formData.phone?.trim() ? formData.phone.replace(/\D/g, "") : undefined,
      });

      if (userProfile) {
        await pb.collection("user_profile").update(userProfile.id, {
          address: formData.address || undefined,
          businessName: formData.businessName || undefined,
          contact: formData.contact || undefined,
          gstIn: formData.gstIn || undefined,
          panNo: formData.panNo || undefined,
        });
      } else {
        const newProfile = await pb.collection("user_profile").create({
          user: currentUser.user.id,
          address: formData.address || undefined,
          businessName: formData.businessName || undefined,
          contact: formData.contact || undefined,
          gstIn: formData.gstIn || undefined,
          panNo: formData.panNo || undefined,
        });
        setUserProfile(newProfile as UserProfileRecord);
      }

      await fetchProfileData();
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
      setSaving(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile.");
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView LoadingText="Loading profile..." />;
  }

  const avatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : null;
  const displayName = user?.name || `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.email || "User";
  const fullName = user?.name || `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "—";
  const phoneDisplay = formatPhone(user?.phone) || formData.phone || "—";

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Header - Gradient */}
      <View className="relative">
        <View
          className="pt-12 pb-20 px-4 items-center bg-primary"
        >
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Icon as={Edit2} size={20} className="text-white" />
          </TouchableOpacity>

          <View className="items-center">
            <View className="relative">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-24 h-24 rounded-full bg-gray-300"
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
                  <Text className="text-2xl font-semibold text-gray-600">{getInitials(user)}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={saving}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-800 items-center justify-center"
              >
                <Icon as={Camera} size={14} className="text-white" />
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-white mt-4">{displayName}</Text>
            {user?.email && (
              <Text className="text-sm text-white/90 mt-1">{user.email}</Text>
            )}
            {user?.role && (
              <View className="mt-2 px-3 py-1 rounded-lg bg-background">
                <Text className="text-sm font-medium text-foreground">{user.role}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content cards - overlap gradient */}
      <View className="px-4 -mt-16 gap-5 pb-8">
        {/* Edit mode: Save/Cancel */}
        {editing && (
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => {
                setEditing(false);
                fetchProfileData();
              }}
              disabled={saving}
            >
              <Icon as={X} size={18} className="mr-2" />
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleSave} disabled={saving}>
              <Icon as={Save} size={18} className="mr-2" />
              <Text>{saving ? "Saving..." : "Save"}</Text>
            </Button>
          </View>
        )}

        {/* PERSONAL INFORMATION */}
        <View>
          <Text className="text-xs text-center font-medium text-white uppercase tracking-wider mb-2">
            Personal Information
          </Text>
          <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0 px-4">
              <InfoRow
                icon={User}
                label="Full Name"
                value={fullName}
                editable={editing}
                inputValue={formData.name || `${formData.firstname} ${formData.lastname}`.trim()}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, name: t }))}
                placeholder="Enter full name"
              />
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={user?.email || ""}
              />
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={phoneDisplay}
                editable={editing}
                inputValue={formData.phone}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, phone: t.replace(/\D/g, "") }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </CardContent>
          </Card>
        </View>

        {/* BUSINESS INFORMATION */}
        <View>
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Business Information
          </Text>
          <Card className="rounded-xl bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0 px-4">
              <InfoRow
                icon={Building2}
                label="Business Name"
                value={userProfile?.businessName || ""}
                editable={editing}
                inputValue={formData.businessName}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, businessName: t }))}
                placeholder="Enter business name"
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={userProfile?.address || ""}
                editable={editing}
                inputValue={formData.address}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, address: t }))}
                placeholder="Enter address"
              />
              <InfoRow
                icon={FileText}
                label="GST IN"
                value={userProfile?.gstIn || ""}
                editable={editing}
                inputValue={formData.gstIn}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, gstIn: t.toUpperCase() }))}
                placeholder="Enter GST IN"
                autoCapitalize="characters"
              />
              <InfoRow
                icon={CreditCard}
                label="PAN No"
                value={userProfile?.panNo || ""}
                editable={editing}
                inputValue={formData.panNo}
                onInputChange={(t) => setFormData((prev) => ({ ...prev, panNo: t.toUpperCase() }))}
                placeholder="Enter PAN number"
                autoCapitalize="characters"
              />
            </CardContent>
          </Card>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={Logout}
          className="flex-row items-center justify-between py-4 px-4 shadow border border-red-300 rounded-xl bg-red-50 active:opacity-80"
        >
          <Text className="text-base font-bold text-red-600">Log Out</Text>
          <Icon as={ChevronRight} size={22} className="text-red-600" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
