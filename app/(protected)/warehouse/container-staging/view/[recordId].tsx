import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseContainerStagingRequestById } from "@/lib/actions/warehouse/containerStaging";

export default function WarehouseContainerStagingViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Container Staging"
      basePath="/(protected)/warehouse/container-staging"
      getRequestById={getWarehouseContainerStagingRequestById}
    />
  );
}
