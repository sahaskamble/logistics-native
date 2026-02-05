import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listContainerStagingRequests } from "@/lib/actions/cfs/containerStaging";

export default function ContainerStagingRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Container Staging"
      basePath="/(protected)/cfs/container-staging"
      listRequests={listContainerStagingRequests}
    />
  );
}
