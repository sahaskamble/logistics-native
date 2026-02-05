import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getContainerStagingRequestById, updateContainerStagingRequest } from "@/lib/actions/cfs/containerStaging";

export default function ContainerStagingEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Container Staging"
      basePath="/(protected)/cfs/container-staging"
      getRequestById={getContainerStagingRequestById}
      updateRequest={updateContainerStagingRequest}
    />
  );
}
