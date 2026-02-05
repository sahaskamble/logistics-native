import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createPriorityMovementsRequest } from "@/lib/actions/cfs/priorityMovements";

export default function PriorityMovementsCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Priority Movements"
      basePath="/(protected)/cfs/priority-movements"
      createRequest={createPriorityMovementsRequest}
    />
  );
}
