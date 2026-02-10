import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehousePriorityMovementsRequest } from "@/lib/actions/warehouse/priorityMovements";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehousePriorityMovementsCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Priority Movements"
      basePath="/(protected)/warehouse/priority-movements"
      createRequest={createWarehousePriorityMovementsRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
