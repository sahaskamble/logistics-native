import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createTariffRequest } from "@/lib/actions/cfs/tariffRequest";

export default function TariffRequestCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Tariff Request"
      basePath="/(protected)/cfs/tariff-request"
      createRequest={createTariffRequest}
    />
  );
}
