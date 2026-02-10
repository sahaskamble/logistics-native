import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseContainerStagingRequest } from "@/lib/actions/warehouse/containerStaging";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseContainerStagingCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Container Staging"
      basePath="/(protected)/warehouse/container-staging"
      createRequest={createWarehouseContainerStagingRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
