import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getSpecialEquipmentRequestById, updateSpecialEquipmentRequest } from "@/lib/actions/cfs/specialEquipment";

export default function SpecialEquipmentEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Special Equipment"
      basePath="/(protected)/cfs/special-equipment"
      getRequestById={getSpecialEquipmentRequestById}
      updateRequest={updateSpecialEquipmentRequest}
    />
  );
}
