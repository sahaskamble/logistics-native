import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getPriorityMovementsRequestById, updatePriorityMovementsRequest } from "@/lib/actions/cfs/priorityMovements";

export default function PriorityMovementsEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Priority Movements"
      basePath="/(protected)/cfs/priority-movements"
      getRequestById={getPriorityMovementsRequestById}
      updateRequest={updatePriorityMovementsRequest}
    />
  );
}
