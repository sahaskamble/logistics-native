import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getTariffRequestById, updateTariffRequest } from "@/lib/actions/cfs/tariffRequest";

export default function TariffRequestEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Tariff Request"
      basePath="/(protected)/cfs/tariff-request"
      getRequestById={getTariffRequestById}
      updateRequest={updateTariffRequest}
    />
  );
}
