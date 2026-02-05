import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getSpecialEquipmentRequestById } from "@/lib/actions/cfs/specialEquipment";

export default function SpecialEquipmentViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Special Equipment"
      basePath="/(protected)/cfs/special-equipment"
      getRequestById={getSpecialEquipmentRequestById}
    />
  );
}
