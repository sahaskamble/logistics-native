import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, ChevronRight, Search } from "lucide-react-native";
import {
  searchCfsOrdersForTrackTrace,
  type CfsOrderRecord,
} from "@/lib/actions/cfs/fetch";

const SUGGESTION_DEBOUNCE_MS = 350;
const MIN_CHARS_FOR_SUGGESTIONS = 2;

function formatCreatedDate(created?: string) {
  if (!created) return "";
  try {
    return new Date(created).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return created;
  }
}

function getStatusConfig(status?: CfsOrderRecord["status"]) {
  switch (status) {
    case "Pending":
      return { variant: "default" as const, bgColor: "bg-yellow-500" };
    case "Accepted":
      return { variant: "secondary" as const, bgColor: "bg-green-500" };
    case "In Progress":
      return { variant: "secondary" as const, bgColor: "bg-gray-400" };
    case "Rejected":
      return { variant: "destructive" as const, bgColor: "bg-red-500" };
    case "Completed":
      return { variant: "outline" as const, bgColor: "bg-blue-500" };
    default:
      return {
        variant: "outline" as const,
        bgColor: "bg-muted-background",
      };
  }
}

export default function TrackTracePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CfsOrderRecord[] | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [suggestions, setSuggestions] = useState<CfsOrderRecord[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term || term.length < MIN_CHARS_FOR_SUGGESTIONS) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const res = await searchCfsOrdersForTrackTrace(term);
      if (res.success && res.output) {
        setSuggestions(res.output.slice(0, 8));
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (term.length < MIN_CHARS_FOR_SUGGESTIONS) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    setSuggestionsLoading(true);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      fetchSuggestions(term);
    }, SUGGESTION_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, fetchSuggestions]);

  const showSuggestionsList =
    searchTerm.trim().length >= MIN_CHARS_FOR_SUGGESTIONS;

  const handleSelectSuggestion = useCallback(
    (order: CfsOrderRecord) => {
      Keyboard.dismiss();
      setSuggestions([]);
      setSearchTerm("");
      router.push({
        pathname: "/(protected)/cfs/track-trace/result/[orderId]",
        params: { orderId: order.id },
      });
    },
    [router]
  );

  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim();
    if (!term) {
      Alert.alert(
        "Enter search term",
        "Enter Order ID, Container ID, BL No, IGM No, or Item No to search."
      );
      return;
    }

    Keyboard.dismiss();
    setSearching(true);
    setSearchedOnce(true);
    setResults(null);

    try {
      const res = await searchCfsOrdersForTrackTrace(term);
      if (!res.success) {
        Alert.alert("Search failed", res.message);
        setResults([]);
        return;
      }
      setResults(res.output || []);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Search failed.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchTerm]);

  const showResults = searchedOnce && results !== null;
  const hasResults = Array.isArray(results) && results.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Track & Trace",
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.replace("/(protected)/home")}
              className="rounded-full mr-2"
            >
              <Icon as={ArrowLeft} size={24} />
            </Button>
          ),
        }}
      />

      <View className="flex-1 bg-background">
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Search your order</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                <Text className="text-muted-foreground text-sm">
                  Search by Order ID, Container ID, BL No, IGM No, or Item No
                </Text>
                <View className="relative">
                  <Input
                    placeholder="Search Order"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    editable={!searching}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  {showSuggestionsList && (
                    <View className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-hidden">
                      {suggestionsLoading ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator size="small" />
                          <Text className="text-muted-foreground text-sm mt-2">
                            Finding orders...
                          </Text>
                        </View>
                      ) : suggestions.length > 0 ? (
                        <ScrollView
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                          className="max-h-64"
                          showsVerticalScrollIndicator={true}
                        >
                          {suggestions.map((order) => {
                            const statusCfg = getStatusConfig(order.status);
                            return (
                              <Pressable
                                key={order.id}
                                onPress={() => handleSelectSuggestion(order)}
                                className="flex-row items-center justify-between px-3 py-3 border-b border-border/50 active:bg-muted"
                              >
                                <View className="flex-1 min-w-0">
                                  <Text className="font-medium" numberOfLines={1}>
                                    {order.id}
                                  </Text>
                                  <View className="flex-row flex-wrap gap-x-2 mt-0.5">
                                    {!!order.blNo && (
                                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                                        BL: {order.blNo}
                                      </Text>
                                    )}
                                    {!!order.igmNo && (
                                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                                        IGM: {order.igmNo}
                                      </Text>
                                    )}
                                    {Array.isArray(order.containers) && order.containers[0] && (
                                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                                        {order.containers[0]}
                                        {order.containers.length > 1 ? ` +${order.containers.length - 1}` : ""}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                                <View className="flex-row items-center gap-1.5 ml-2">
                                  <Badge variant={statusCfg.variant} className={`${statusCfg.bgColor} max-w-20`}>
                                    <Text className="text-xs text-white" numberOfLines={1}>
                                      {order.status || "—"}
                                    </Text>
                                  </Badge>
                                  <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
                                </View>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      ) : (
                        <View className="py-3 px-3">
                          <Text className="text-muted-foreground text-sm text-center">
                            No matching orders
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <Button
                  onPress={handleSearch}
                  disabled={searching}
                  className="flex-row items-center gap-2"
                >
                  {searching ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Icon as={Search} size={20} className="text-primary-foreground" />
                  )}
                  <Text className="text-primary-foreground font-medium">
                    {searching ? "Searching..." : "Search"}
                  </Text>
                </Button>
              </CardContent>
            </Card>

            {showResults && (
              <View className="gap-2">
                <Text className="text-lg font-semibold">
                  {hasResults
                    ? `${results!.length} order(s) found`
                    : "No orders found"}
                </Text>
                {hasResults ? (
                  results!.map((order) => {
                    const statusCfg = getStatusConfig(order.status);
                    const createdLabel = formatCreatedDate(order.created);
                    return (
                      <Pressable
                        key={order.id}
                        onPress={() => {
                          router.push({
                            pathname: "/(protected)/cfs/track-trace/result/[orderId]",
                            params: { orderId: order.id },
                          });
                        }}
                      >
                        <Card className="active:opacity-90">
                          <CardHeader>
                            <View className="flex-row items-center justify-between">
                              <CardTitle>Order #{order.id}</CardTitle>
                              <Badge
                                variant={statusCfg.variant}
                                className={statusCfg.bgColor}
                              >
                                <Text className="text-xs text-white">
                                  {order.status || "Unknown"}
                                </Text>
                              </Badge>
                            </View>
                          </CardHeader>
                          <CardContent className="gap-1">
                            {!!order.igmNo && (
                              <Text className="text-sm">IGM No: {order.igmNo}</Text>
                            )}
                            {!!order.itemNo && (
                              <Text className="text-sm">Item No: {order.itemNo}</Text>
                            )}
                            {!!order.blNo && (
                              <Text className="text-sm">BL No: {order.blNo}</Text>
                            )}
                            {Array.isArray(order.containers) &&
                              order.containers.length > 0 && (
                                <Text className="text-sm">
                                  Container(s): {order.containers.join(", ")}
                                </Text>
                              )}
                            {!!createdLabel && (
                              <Text className="text-sm text-muted-foreground">
                                {createdLabel}
                              </Text>
                            )}
                            <Text className="text-sm text-primary mt-1">
                              Tap to view details →
                            </Text>
                          </CardContent>
                        </Card>
                      </Pressable>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="py-6">
                      <Text className="text-muted-foreground text-center">
                        No orders match "{searchTerm.trim()}". Check the value and
                        try again.
                      </Text>
                    </CardContent>
                  </Card>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
