import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseContainerGroundingRequests } from "@/lib/actions/warehouse/containerGrounding";

export default function WarehouseContainerGroundingListPage() {
  return (
    <ServiceRequestListScreen
      title="Container Grounding"
      basePath="/(protected)/warehouse/container-grounding"
      listRequests={listWarehouseContainerGroundingRequests}
    />
  );
}
