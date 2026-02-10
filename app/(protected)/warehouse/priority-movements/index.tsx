import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehousePriorityMovementsRequests } from "@/lib/actions/warehouse/priorityMovements";

export default function WarehousePriorityMovementsListPage() {
  return (
    <ServiceRequestListScreen
      title="Priority Movements"
      basePath="/(protected)/warehouse/priority-movements"
      listRequests={listWarehousePriorityMovementsRequests}
    />
  );
}
