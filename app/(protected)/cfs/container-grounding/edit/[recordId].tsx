import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getContainerGroundingRequestById, updateContainerGroundingRequest } from "@/lib/actions/cfs/containerGrounding";

export default function ContainerGroundingEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Container Grounding"
      basePath="/(protected)/cfs/container-grounding"
      getRequestById={getContainerGroundingRequestById}
      updateRequest={updateContainerGroundingRequest}
    />
  );
}
