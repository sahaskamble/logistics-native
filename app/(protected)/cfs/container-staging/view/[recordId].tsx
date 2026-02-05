import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getContainerStagingRequestById } from "@/lib/actions/cfs/containerStaging";

export default function ContainerStagingViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Container Staging"
      basePath="/(protected)/cfs/container-staging"
      getRequestById={getContainerStagingRequestById}
    />
  );
}
