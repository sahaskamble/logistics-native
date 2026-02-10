import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseEirCopyRequestById, updateWarehouseEirCopyRequest } from "@/lib/actions/warehouse/eirCopy";

export default function WarehouseEirCopyEditPage() {
  return (
    <ServiceRequestEditScreen
      title="EIR Copy"
      basePath="/(protected)/warehouse/eir-copy"
      getRequestById={getWarehouseEirCopyRequestById}
      updateRequest={updateWarehouseEirCopyRequest}
    />
  );
}
