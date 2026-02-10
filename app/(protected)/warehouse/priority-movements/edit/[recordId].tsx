import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehousePriorityMovementsRequestById, updateWarehousePriorityMovementsRequest } from "@/lib/actions/warehouse/priorityMovements";

export default function WarehousePriorityMovementsEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Priority Movements"
      basePath="/(protected)/warehouse/priority-movements"
      getRequestById={getWarehousePriorityMovementsRequestById}
      updateRequest={updateWarehousePriorityMovementsRequest}
    />
  );
}
