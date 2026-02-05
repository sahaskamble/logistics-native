import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createChequeAcceptanceRequest } from "@/lib/actions/cfs/chequeAcceptance";

export default function ChequeAcceptanceCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Cheque Acceptance"
      basePath="/(protected)/cfs/cheque-acceptance"
      createRequest={createChequeAcceptanceRequest}
    />
  );
}
