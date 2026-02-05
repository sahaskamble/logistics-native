import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listProformaInvoiceRequests } from "@/lib/actions/cfs/proformaInvoice";

export default function ProformaInvoiceRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Proforma Invoice"
      basePath="/(protected)/cfs/proforma-invoice"
      listRequests={listProformaInvoiceRequests}
    />
  );
}
