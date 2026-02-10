import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseContainerStagingRequests } from "@/lib/actions/warehouse/containerStaging";

export default function WarehouseContainerStagingListPage() {
  return (
    <ServiceRequestListScreen
      title="Container Staging"
      basePath="/(protected)/warehouse/container-staging"
      listRequests={listWarehouseContainerStagingRequests}
    />
  );
}
