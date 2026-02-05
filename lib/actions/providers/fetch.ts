import pb from "@/lib/pocketbase/pb";
import { mergeFilters, type PbQueryOptions } from "@/lib/actions/pbOptions";

export type ServiceProvider = {
  id: string;
  title?: string;
  description?: string;
  files?: string[];
  rating?: number;
  features?: string[];
  tags?: string[];
  service?: string[];
  location?: string;
  contact?: string;
  verified?: boolean;
  created?: string;
  expand?: any;
};

export async function getServiceProviders(params?: {
  serviceTitle?: string;
  searchQuery?: string;
  options?: PbQueryOptions;
}): Promise<{ success: boolean; message: string; output: ServiceProvider[] }> {
  try {
    const isUserValid = pb.authStore.isValid && pb.authStore.record?.role === "Customer";
    if (isUserValid) {
      const options = params?.options;
      const serviceTitle = params?.serviceTitle;
      const searchQuery = params?.searchQuery;

      // Build filter - always include verified=true
      let baseFilter = "verified=true";

      // If search query is provided, add search filter
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim().replace(/\"/g, "\\\"");
        baseFilter += ` && (title~"${searchTerm}" || description~"${searchTerm}")`;
      }

      // Fetch all verified providers with expanded service relation
      const response = await pb.collection("service_provider").getFullList<ServiceProvider>({
        ...options,
        filter: mergeFilters(baseFilter, options?.filter),
        sort: options?.sort || "-created",
        expand: options?.expand || "service,author",
      });

      // Filter by service title if provided (using expanded relation data)
      let filteredProviders = response;
      if (serviceTitle && serviceTitle.trim()) {
        const wanted = serviceTitle.trim().toLowerCase();
        filteredProviders = response.filter((provider) => {
          // Check if provider has expanded service relation
          const expandedServices = (provider as any).expand?.service;
          if (!expandedServices) return false;

          // Handle both array and single service cases
          const services = Array.isArray(expandedServices) ? expandedServices : [expandedServices];

          // Check if any service has matching title
          return services.some((service: any) => (service?.title || "").toString().toLowerCase() === wanted);
        });
      }

      return {
        success: true,
        message: "Fetched all service_providers",
        output: filteredProviders,
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
