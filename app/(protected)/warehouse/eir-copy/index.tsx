import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseEirCopyRequests } from "@/lib/actions/warehouse/eirCopy";

export default function WarehouseEirCopyListPage() {
  return (
    <ServiceRequestListScreen
      title="EIR Copy"
      basePath="/(protected)/warehouse/eir-copy"
      listRequests={listWarehouseEirCopyRequests}
    />
  );
}
