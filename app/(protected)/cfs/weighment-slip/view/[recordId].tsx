import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWeighmentSlipRequestById } from "@/lib/actions/cfs/weighmentSlip";

export default function WeighmentSlipViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Weighment Slip"
      basePath="/(protected)/cfs/weighment-slip"
      getRequestById={getWeighmentSlipRequestById}
    />
  );
}
