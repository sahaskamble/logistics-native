import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createContainerGroundingRequest } from "@/lib/actions/cfs/containerGrounding";

export default function ContainerGroundingCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Container Grounding"
      basePath="/(protected)/cfs/container-grounding"
      createRequest={createContainerGroundingRequest}
    />
  );
}
