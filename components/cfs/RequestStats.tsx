import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { CircleCheckBig, CircleX, ClipboardCheck, Clock, Loader, LucideIcon } from "lucide-react-native";

import { Card, CardContent } from "../ui/card";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

export type RequestStatus = "Pending" | "Accepted" | "Rejected" | "In Progress" | "Completed";

export type RequestStatsItem = {
  title: string;
  icon: LucideIcon;
  value: number;
  iconColor: string;
  statusFilter: RequestStatus | "All";
};

export default function RequestStats<T extends { status?: RequestStatus }>({
  serviceTitle,
  requests,
  selectedStatus,
  onStatusChange,
}: {
  serviceTitle: string;
  requests: T[];
  selectedStatus: RequestStatus | "All";
  onStatusChange: (status: RequestStatus | "All") => void;
}) {
  const stats: RequestStatsItem[] = useMemo(() => {
    const counts = {
      total: requests.length,
      accepted: requests.filter((o) => o.status === "Accepted").length,
      completed: requests.filter((o) => o.status === "Completed").length,
      pending: requests.filter((o) => o.status === "Pending").length,
      inProgress: requests.filter((o) => o.status === "In Progress").length,
      rejected: requests.filter((o) => o.status === "Rejected").length,
    };

    return [
      { title: `All ${serviceTitle}`, icon: CircleCheckBig, value: counts.total, iconColor: "text-gray-500", statusFilter: "All" },
      { title: "Accepted", icon: CircleCheckBig, value: counts.accepted, iconColor: "text-green-500", statusFilter: "Accepted" },
      { title: "Completed", icon: ClipboardCheck, value: counts.completed, iconColor: "text-blue-500", statusFilter: "Completed" },
      { title: "Pending", icon: Clock, value: counts.pending, iconColor: "text-yellow-500", statusFilter: "Pending" },
      { title: "In Progress", icon: Loader, value: counts.inProgress, iconColor: "text-gray-400", statusFilter: "In Progress" },
      { title: "Rejected", icon: CircleX, value: counts.rejected, iconColor: "text-red-500", statusFilter: "Rejected" },
    ];
  }, [requests, serviceTitle]);

  return (
    <View className="p-4">
      <View className="flex-row flex-wrap -mx-2">
        {stats.map((stat) => {
          const active = selectedStatus === stat.statusFilter;
          return (
            <View key={stat.title} className="w-1/2 px-2 mb-4">
              <Pressable onPress={() => onStatusChange(stat.statusFilter)}>
                <Card className={active ? "border-2 border-primary p-4" : "p-4"}>
                  <CardContent className="p-0">
                    <View className="flex-row items-center gap-3 pb-2">
                      <Icon as={stat.icon} className={`${stat.iconColor || "text-foreground"} size-8`} />
                      <Text className="text-2xl font-bold">{stat.value}</Text>
                    </View>
                    <Text className="text-sm text-muted-foreground">{stat.title}</Text>
                  </CardContent>
                </Card>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
