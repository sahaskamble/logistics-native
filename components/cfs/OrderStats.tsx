import { CfsOrderRecord } from '@/lib/actions/cfs/fetch'
import { Pressable, View } from 'react-native'
import { Text } from '../ui/text';
import { Card, CardContent } from '../ui/card';
import { Icon } from '../ui/icon';
import { CircleCheckBig, CircleX, ClipboardCheck, Clock, Container, Loader, LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Title } from '@rn-primitives/dialog';

export type OrderStatus = NonNullable<CfsOrderRecord["status"]>;

type OrderStatsItem = {
  title: string;
  icon: LucideIcon;
  value: number;
  iconColor: string;
  statusFilter: OrderStatus | "All";
}

export default function OrderStats({
  orders,
  selectedStatus,
  onStatusChange,
}: {
  orders: CfsOrderRecord[];
  selectedStatus: OrderStatus | "All";
  onStatusChange: (status: OrderStatus | "All") => void;
}) {
  const stats: OrderStatsItem[] = useMemo(() => {
    const counts = {
      total: orders.length,
      approved: orders.filter((o) => o.status === "Accepted").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      pending: orders.filter((o) => o.status === "Pending").length,
      inProgress: orders.filter((o) => o.status === "In Progress").length,
      rejected: orders.filter((o) => o.status === "Rejected").length,
    };

    return [
      { title: "All Orders", icon: Container, value: counts.total, iconColor: "text-gray-500", statusFilter: "All" },
      { title: "Accepted", icon: CircleCheckBig, value: counts.approved, iconColor: "text-green-500", statusFilter: "Accepted" },
      { title: "Completed", icon: ClipboardCheck, value: counts.completed, iconColor: "text-blue-500", statusFilter: "Completed" },
      { title: "Pending", icon: Clock, value: counts.pending, iconColor: "text-yellow-500", statusFilter: "Pending" },
      { title: "In Progress", icon: Loader, value: counts.inProgress, iconColor: "text-gray-400", statusFilter: "In Progress" },
      { title: "Rejected", icon: CircleX, value: counts.rejected, iconColor: "text-red-500", statusFilter: "Rejected" },
    ]
  }, [orders]);

  return (
    <View className="p-4">
      <View className="flex-row flex-wrap -mx-2">
        {stats.map((stat) => {
          const active = selectedStatus === stat.statusFilter;
          return (
            <View key={stat.title} className="w-1/2 px-2 mb-4">
              <Pressable onPress={() => onStatusChange(stat.statusFilter)}>
                <Card className={active ? "border-primary p-4" : "p-4"}>
                  <CardContent className="p-0">
                    <View className="flex-row items-center gap-3 pb-2">
                      <Icon as={stat.icon} className={`${stat.iconColor || 'text-foreground'} size-8`} />
                      <Text className="text-2xl font-bold">{stat.value}</Text>
                    </View>
                    <Text className="text-sm text-muted-foreground">{stat.title}</Text>
                  </CardContent>
                </Card>
              </Pressable>
            </View>
          )
        })}
      </View>
    </View>
  )
}
