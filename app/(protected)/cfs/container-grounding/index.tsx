import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listContainerGroundingRequests } from "@/lib/actions/cfs/containerGrounding";

export default function ContainerGroundingRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Container Grounding"
      basePath="/(protected)/cfs/container-grounding"
      listRequests={listContainerGroundingRequests}
    />
  );
}
