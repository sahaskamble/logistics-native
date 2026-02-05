import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listSpecialEquipmentRequests } from "@/lib/actions/cfs/specialEquipment";

export default function SpecialEquipmentRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Special Equipment"
      basePath="/(protected)/cfs/special-equipment"
      listRequests={listSpecialEquipmentRequests}
    />
  );
}
