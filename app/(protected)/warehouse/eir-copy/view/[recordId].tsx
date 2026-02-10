import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseEirCopyRequestById } from "@/lib/actions/warehouse/eirCopy";

export default function WarehouseEirCopyViewPage() {
  return (
    <ServiceRequestViewScreen
      title="EIR Copy"
      basePath="/(protected)/warehouse/eir-copy"
      getRequestById={getWarehouseEirCopyRequestById}
    />
  );
}
