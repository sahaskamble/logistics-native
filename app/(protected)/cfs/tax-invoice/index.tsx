import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listTaxInvoiceRequests } from "@/lib/actions/cfs/taxInvoice";

export default function TaxInvoiceRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Tax Invoice"
      basePath="/(protected)/cfs/tax-invoice"
      listRequests={listTaxInvoiceRequests}
    />
  );
}
