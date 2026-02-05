import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getPriorityMovementsRequestById } from "@/lib/actions/cfs/priorityMovements";

export default function PriorityMovementsViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Priority Movements"
      basePath="/(protected)/cfs/priority-movements"
      getRequestById={getPriorityMovementsRequestById}
    />
  );
}
