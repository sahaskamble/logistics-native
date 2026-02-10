import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseContainerStagingRequestById, updateWarehouseContainerStagingRequest } from "@/lib/actions/warehouse/containerStaging";

export default function WarehouseContainerStagingEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Container Staging"
      basePath="/(protected)/warehouse/container-staging"
      getRequestById={getWarehouseContainerStagingRequestById}
      updateRequest={updateWarehouseContainerStagingRequest}
    />
  );
}
