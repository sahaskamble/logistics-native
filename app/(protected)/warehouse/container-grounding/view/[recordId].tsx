import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseContainerGroundingRequestById } from "@/lib/actions/warehouse/containerGrounding";

export default function WarehouseContainerGroundingViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Container Grounding"
      basePath="/(protected)/warehouse/container-grounding"
      getRequestById={getWarehouseContainerGroundingRequestById}
    />
  );
}
