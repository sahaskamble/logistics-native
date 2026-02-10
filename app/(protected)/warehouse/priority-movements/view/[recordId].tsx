import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehousePriorityMovementsRequestById } from "@/lib/actions/warehouse/priorityMovements";

export default function WarehousePriorityMovementsViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Priority Movements"
      basePath="/(protected)/warehouse/priority-movements"
      getRequestById={getWarehousePriorityMovementsRequestById}
    />
  );
}
