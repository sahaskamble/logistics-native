import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseContainerGroundingRequestById, updateWarehouseContainerGroundingRequest } from "@/lib/actions/warehouse/containerGrounding";

export default function WarehouseContainerGroundingEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Container Grounding"
      basePath="/(protected)/warehouse/container-grounding"
      getRequestById={getWarehouseContainerGroundingRequestById}
      updateRequest={updateWarehouseContainerGroundingRequest}
    />
  );
}
