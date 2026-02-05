import { useState, useEffect } from "react";
import { ScrollView, View, Image, Alert, TouchableOpacity, Platform, RefreshControl, InteractionManager } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { Camera, Edit2, Save, X, Mail, Phone, MapPin, Building, FileText, User } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);
  const { Logout } = useRootAuth();
  const [formData, setFormData] = useState({
    // Users collection fields
    firstname: "",
    lastname: "",
    name: "",
    phone: "",
    // User profile fields
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

      // Fetch user data from users collection
      const userData = await pb.collection("users").getOne<UserRecord>(currentUser.user.id);
      setUser(userData);

      // Fetch user profile data
      try {
        const profileData = await pb.collection("user_profile").getFirstListItem<UserProfileRecord>(
          `user="${currentUser.user.id}"`
        );
        setUserProfile(profileData as any);
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
        // User profile might not exist yet, create it
        if (error?.status === 404) {
          try {
            const newProfile = await pb.collection("user_profile").create<UserProfileRecord>({
              user: currentUser.user.id,
            });
            setUserProfile(newProfile as any);
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
        const formData = new FormData();

        // @ts-ignore
        formData.append("avatar", {
          uri: asset.uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });

        setSaving(true);
        await pb.collection("users").update(user!.id, formData);

        // Refresh user data
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

      // Update users collection
      await pb.collection("users").update(currentUser.user.id, {
        firstname: formData.firstname || undefined,
        lastname: formData.lastname || undefined,
        name: formData.name || undefined,
        phone: formData.phone ? parseInt(formData.phone) : undefined,
      });

      // Update or create user_profile
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
        setUserProfile(newProfile);
      }

      // Refresh data
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

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4 gap-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="items-center pt-6 pb-4">
            <View className="relative mb-4">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-24 h-24 rounded-full"
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                  <Icon as={User} size={48} className="text-primary" />
                </View>
              )}
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={saving}
                className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-background"
              >
                <Icon as={Camera} size={20} className="text-primary-foreground" />
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-bold text-center">{displayName}</Text>
            {user?.email && (
              <View className="flex-row items-center gap-2 mt-2">
                <Icon as={Mail} size={16} className="text-muted-foreground" />
                <Text className="text-muted-foreground">{user.email}</Text>
              </View>
            )}
            {user?.role && (
              <Badge variant="secondary" className="mt-2">
                <Text>{user.role}</Text>
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Edit/Save Button */}
        <View className="flex-row gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {
                  setEditing(false);
                  fetchProfileData(); // Reset form data
                }}
                disabled={saving}
              >
                <Icon as={X} size={20} className="mr-2" />
                <Text>Cancel</Text>
              </Button>
              <Button
                className="flex-1"
                onPress={handleSave}
                disabled={saving}
              >
                <Icon as={Save} size={20} className="mr-2" />
                <Text>{saving ? "Saving..." : "Save"}</Text>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setEditing(true)}
            >
              <Icon as={Edit2} size={20} className="mr-2" />
              <Text>Edit Profile</Text>
            </Button>
          )}
        </View>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>Full Name</Label>
              {editing ? (
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                />
              ) : (
                <Text className="text-base">{user?.name || "Not set"}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>First Name</Label>
              {editing ? (
                <Input
                  value={formData.firstname}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, firstname: text }))}
                  placeholder="Enter first name"
                />
              ) : (
                <Text className="text-base">{user?.firstname || "Not set"}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>Last Name</Label>
              {editing ? (
                <Input
                  value={formData.lastname}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, lastname: text }))}
                  placeholder="Enter last name"
                />
              ) : (
                <Text className="text-base">{user?.lastname || "Not set"}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>Email</Label>
              <View className="flex-row items-center gap-2">
                <Icon as={Mail} size={16} className="text-muted-foreground" />
                <Text className="text-base">{user?.email || "Not set"}</Text>
              </View>
              <Text className="text-xs text-muted-foreground">Email cannot be changed</Text>
            </View>

            <View className="gap-2">
              <Label>Phone</Label>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text.replace(/\D/g, "") }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Icon as={Phone} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{user?.phone || "Not set"}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>Business Name</Label>
              {editing ? (
                <Input
                  value={formData.businessName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, businessName: text }))}
                  placeholder="Enter business name"
                />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Icon as={Building} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{userProfile?.businessName || "Not set"}</Text>
                </View>
              )}
            </View>

            <View className="gap-2">
              <Label>Address</Label>
              {editing ? (
                <Input
                  value={formData.address}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={3}
                  className="min-h-[80px]"
                />
              ) : (
                <View className="flex-row items-start gap-2">
                  <Icon as={MapPin} size={16} className="text-muted-foreground mt-1" />
                  <Text className="text-base flex-1">{userProfile?.address || "Not set"}</Text>
                </View>
              )}
            </View>

            <View className="gap-2">
              <Label>Contact</Label>
              {editing ? (
                <Input
                  value={formData.contact}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, contact: text }))}
                  placeholder="Enter contact information"
                />
              ) : (
                <Text className="text-base">{userProfile?.contact || "Not set"}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>GST IN</Label>
              {editing ? (
                <Input
                  value={formData.gstIn}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, gstIn: text.toUpperCase() }))}
                  placeholder="Enter GST IN"
                  autoCapitalize="characters"
                />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Icon as={FileText} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{userProfile?.gstIn || "Not set"}</Text>
                </View>
              )}
            </View>

            <View className="gap-2">
              <Label>PAN No</Label>
              {editing ? (
                <Input
                  value={formData.panNo}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, panNo: text.toUpperCase() }))}
                  placeholder="Enter PAN number"
                  autoCapitalize="characters"
                />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Icon as={FileText} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{userProfile?.panNo || "Not set"}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="mb-8"
          onPress={Logout}
        >
          <Text className="text-destructive-foreground">Logout</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
