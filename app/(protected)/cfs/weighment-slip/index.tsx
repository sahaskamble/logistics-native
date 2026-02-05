import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWeighmentSlipRequests } from "@/lib/actions/cfs/weighmentSlip";

export default function WeighmentSlipRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Weighment Slip"
      basePath="/(protected)/cfs/weighment-slip"
      listRequests={listWeighmentSlipRequests}
    />
  );
}
