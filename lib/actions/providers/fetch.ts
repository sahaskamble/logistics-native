import { ServiceProviderResponse } from "@/lib/pocketbase-types";
import pb from "@/lib/pocketbase/pb";

export async function getServiceProviders(): Promise<{ success: Boolean, message: string, output: ServiceProviderResponse[] }> {
  try {
    const isUserValid = pb.authStore.isValid && pb.authStore.record?.role === "Customer";
    if (isUserValid) {
      const response = await pb.collection("service_provider").getFullList<ServiceProviderResponse>({
        filter: "verified=true",
        sort: "-created",
      });
      return {
        success: true,
        message: "Fetched all service_providers",
        output: response,
      };
    } else {
      return {
        success: false,
        message: "User must be valid please re-login once",
        output: [],
      }
    }
  } catch (err) {
    console.error("Error fetching service_providers", err);
    return {
      success: false,
      message: `Error fetching service_providers:- ${err}`,
      output: [],
    };
  }
}
