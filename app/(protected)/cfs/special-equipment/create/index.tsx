import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createSpecialEquipmentRequest } from "@/lib/actions/cfs/specialEquipment";

export default function SpecialEquipmentCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Special Equipment"
      basePath="/(protected)/cfs/special-equipment"
      createRequest={createSpecialEquipmentRequest}
    />
  );
}
