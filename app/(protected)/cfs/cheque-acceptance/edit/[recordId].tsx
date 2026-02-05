import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getChequeAcceptanceRequestById, updateChequeAcceptanceRequest } from "@/lib/actions/cfs/chequeAcceptance";

export default function ChequeAcceptanceEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Cheque Acceptance"
      basePath="/(protected)/cfs/cheque-acceptance"
      getRequestById={getChequeAcceptanceRequestById}
      updateRequest={updateChequeAcceptanceRequest}
    />
  );
}
