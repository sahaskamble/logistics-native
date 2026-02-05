import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getContainerGroundingRequestById } from "@/lib/actions/cfs/containerGrounding";

export default function ContainerGroundingViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Container Grounding"
      basePath="/(protected)/cfs/container-grounding"
      getRequestById={getContainerGroundingRequestById}
    />
  );
}
