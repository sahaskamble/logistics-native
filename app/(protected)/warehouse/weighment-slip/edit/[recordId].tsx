import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseWeighmentSlipRequestById, updateWarehouseWeighmentSlipRequest } from "@/lib/actions/warehouse/weighmentSlip";

export default function WarehouseWeighmentSlipEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Weighment Slip"
      basePath="/(protected)/warehouse/weighment-slip"
      getRequestById={getWarehouseWeighmentSlipRequestById}
      updateRequest={updateWarehouseWeighmentSlipRequest}
    />
  );
}
