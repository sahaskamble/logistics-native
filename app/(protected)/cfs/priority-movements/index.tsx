import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listPriorityMovementsRequests } from "@/lib/actions/cfs/priorityMovements";

export default function PriorityMovementsRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Priority Movements"
      basePath="/(protected)/cfs/priority-movements"
      listRequests={listPriorityMovementsRequests}
    />
  );
}
