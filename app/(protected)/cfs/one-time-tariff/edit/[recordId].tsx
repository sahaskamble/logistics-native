import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getOneTimeTariffRequestById, updateOneTimeTariffRequest } from "@/lib/actions/cfs/oneTimeTariff";

export default function OneTimeTariffEditPage() {
  return (
    <ServiceRequestEditScreen
      title="One Time Tariff"
      basePath="/(protected)/cfs/one-time-tariff"
      getRequestById={getOneTimeTariffRequestById}
      updateRequest={updateOneTimeTariffRequest}
    />
  );
}
