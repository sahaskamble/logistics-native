import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseContainerGroundingRequest } from "@/lib/actions/warehouse/containerGrounding";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseContainerGroundingCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Container Grounding"
      basePath="/(protected)/warehouse/container-grounding"
      createRequest={createWarehouseContainerGroundingRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
