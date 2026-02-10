import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseWeighmentSlipRequestById } from "@/lib/actions/warehouse/weighmentSlip";

export default function WarehouseWeighmentSlipViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Weighment Slip"
      basePath="/(protected)/warehouse/weighment-slip"
      getRequestById={getWarehouseWeighmentSlipRequestById}
    />
  );
}
