import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createContainerStagingRequest } from "@/lib/actions/cfs/containerStaging";

export default function ContainerStagingCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Container Staging"
      basePath="/(protected)/cfs/container-staging"
      createRequest={createContainerStagingRequest}
    />
  );
}
