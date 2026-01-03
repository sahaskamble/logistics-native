import { useState, useEffect } from "react";
import { ScrollView, View, useWindowDimensions, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingView from "@/components/LoadingView";
import { Icon } from "@/components/ui/icon";
import { Package, Clock, XCircle, CheckCircle2, TrendingUp } from "lucide-react-native";
import * as Victory from "victory-native";
import { listCfsOrdersForCurrentUser } from "@/lib/actions/cfs/fetch";

type CfsOrder = {
  id: string;
  created?: string;
  status?: string;
  orderDescription?: string;
  blNo?: string;
  igmNo?: string;
};

interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  rejected: number;
  completed: number;
}

type ChartType = "bar" | "line" | "pie";

function OrderChart({ stats, chartType }: { stats: OrderStats; chartType: ChartType }) {
  const { width } = useWindowDimensions();

  const chartWidth = Math.max(240, width - 64);
  const chartHeight = Math.round(Math.min(280, Math.max(180, chartWidth * 0.6)));

  const series = [
    { x: "Pending", y: stats.pending, color: "#eab308" },
    { x: "In Progress", y: stats.inProgress, color: "#3b82f6" },
    { x: "Rejected", y: stats.rejected, color: "#ef4444" },
    { x: "Completed", y: stats.completed, color: "#22c55e" },
  ];

  if (chartType === "bar") {
    return (
      <View className="py-2">
        <Victory.VictoryChart
          width={chartWidth}
          height={chartHeight}
          theme={Victory.VictoryTheme.material}
          domainPadding={{ x: 28, y: 18 }}
        >
          <Victory.VictoryAxis
            tickValues={series.map((s) => s.x)}
            style={{
              tickLabels: { fontSize: 11, angle: 0, padding: 8 },
              axis: { stroke: "#e5e7eb" },
              ticks: { stroke: "#e5e7eb" },
              grid: { stroke: "transparent" },
            }}
          />
          <Victory.VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 11, padding: 6 },
              axis: { stroke: "#e5e7eb" },
              ticks: { stroke: "#e5e7eb" },
              grid: { stroke: "#f3f4f6" },
            }}
          />
          <Victory.VictoryBar
            data={series}
            style={{
              data: {
                fill: ({ datum }: { datum: { color: string } }) => datum.color,
              },
            }}
          />
        </Victory.VictoryChart>
      </View>
    );
  }

  if (chartType === "line") {
    return (
      <View className="py-2">
        <Victory.VictoryChart
          width={chartWidth}
          height={chartHeight}
          theme={Victory.VictoryTheme.material}
          domainPadding={{ x: 28, y: 18 }}
        >
          <Victory.VictoryAxis
            tickValues={series.map((s) => s.x)}
            style={{
              tickLabels: { fontSize: 11, angle: 0, padding: 8 },
              axis: { stroke: "#e5e7eb" },
              ticks: { stroke: "#e5e7eb" },
              grid: { stroke: "transparent" },
            }}
          />
          <Victory.VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 11, padding: 6 },
              axis: { stroke: "#e5e7eb" },
              ticks: { stroke: "#e5e7eb" },
              grid: { stroke: "#f3f4f6" },
            }}
          />
          <Victory.VictoryLine data={series} style={{ data: { stroke: "#111827", strokeWidth: 2 } }} />
        </Victory.VictoryChart>
      </View>
    );
  }

  if (chartType === "pie") {
    return (
      <View className="py-2">
        <Victory.VictoryPie
          width={chartWidth}
          height={chartHeight}
          data={series.map((s) => ({ x: s.x, y: s.y, label: s.x }))}
          colorScale={series.map((s) => s.color)}
          innerRadius={Math.round(chartHeight * 0.18)}
          padAngle={1.5}
          labels={({ datum }: { datum: { x: string; y: number } }) => `${datum.x}: ${datum.y}`}
          style={{ labels: { fontSize: 11, fill: "#374151" } }}
        />
      </View>
    );
  }

  return null;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
    completed: 0,
  });
  const [recentOrders, setRecentOrders] = useState<CfsOrder[]>([]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all CFS orders for the user
      const ordersRes = await listCfsOrdersForCurrentUser();
      if (!ordersRes.success) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const orders = ordersRes.output as CfsOrder[];

      // Calculate statistics
      const newStats: OrderStats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "Pending").length,
        inProgress: orders.filter((o) => o.status === "In Progress").length,
        rejected: orders.filter((o) => o.status === "Rejected").length,
        completed: orders.filter((o) => o.status === "Completed").length,
      };

      setStats(newStats);
      setRecentOrders(orders.slice(0, 10)); // Get 10 most recent orders
      setLoading(false);
      setRefreshing(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingView LoadingText="Loading dashboard..." />;
  }

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "Pending":
        return "default";
      case "In Progress":
        return "secondary";
      case "Rejected":
        return "destructive";
      case "Completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "In Progress":
        return "text-blue-600";
      case "Rejected":
        return "text-red-600";
      case "Completed":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4 gap-4">
        {/* Statistics Cards */}
        <View className="flex-row flex-wrap gap-3">
          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={Package} size={24} className="text-primary" />
                <Text className="text-2xl font-bold">{stats.total}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={Clock} size={24} className="text-yellow-500" />
                <Text className="text-2xl font-bold">{stats.pending}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={TrendingUp} size={24} className="text-blue-500" />
                <Text className="text-2xl font-bold">{stats.inProgress}</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[150px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Icon as={XCircle} size={24} className="text-red-500" />
                <Text className="text-2xl font-bold">{stats.rejected}</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Chart */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Order Status Distribution</CardTitle>
              <View className="flex-row gap-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onPress={() => setChartType("bar")}
                >
                  <Text className="text-xs">Bar</Text>
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onPress={() => setChartType("line")}
                >
                  <Text className="text-xs">Line</Text>
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onPress={() => setChartType("pie")}
                >
                  <Text className="text-xs">Pie</Text>
                </Button>
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <OrderChart stats={stats} chartType={chartType} />
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {recentOrders.length === 0 ? (
              <View className="items-center py-8">
                <Icon as={Package} size={48} className="text-muted-foreground mb-2" />
                <Text className="text-muted-foreground">No orders found</Text>
              </View>
            ) : (
              recentOrders.map((order) => (
                <View
                  key={order.id}
                  className="flex-row items-center justify-between p-3 border border-border rounded-lg"
                >
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-semibold text-base">
                        {order.orderDescription || order.blNo || `Order #${order.id.slice(0, 8)}`}
                      </Text>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        <Text className="text-xs">{order.status || "Unknown"}</Text>
                      </Badge>
                    </View>
                    {order.blNo && (
                      <Text className="text-sm text-muted-foreground">BL No: {order.blNo}</Text>
                    )}
                    {order.igmNo && (
                      <Text className="text-sm text-muted-foreground">IGM No: {order.igmNo}</Text>
                    )}
                    <Text className="text-xs text-muted-foreground">
                      {order.created
                        ? new Date(order.created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
