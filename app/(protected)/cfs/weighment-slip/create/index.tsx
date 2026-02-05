import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWeighmentSlipRequest } from "@/lib/actions/cfs/weighmentSlip";

export default function WeighmentSlipCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Weighment Slip"
      basePath="/(protected)/cfs/weighment-slip"
      createRequest={createWeighmentSlipRequest}
    />
  );
}
