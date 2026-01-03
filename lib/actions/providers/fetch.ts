import pb from "@/lib/pocketbase/pb";

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

export async function getServiceProviders(
  serviceTitle?: string,
  searchQuery?: string
): Promise<{ success: Boolean, message: string, output: ServiceProvider[] }> {
  try {
    const isUserValid = pb.authStore.isValid && pb.authStore.record?.role === "Customer";
    if (isUserValid) {
      // Build filter - always include verified=true
      let filter = "verified=true";

      // If search query is provided, add search filter
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        filter += ` && (title~"${searchTerm}" || description~"${searchTerm}")`;
      }

      // Fetch all verified providers with expanded service relation
      const response = await pb.collection("service_provider").getFullList<ServiceProvider>({
        filter: filter,
        sort: "-created",
        expand: "service,author",
      });

      // Filter by service title if provided (using expanded relation data)
      let filteredProviders = response;
      if (serviceTitle && serviceTitle.trim()) {
        filteredProviders = response.filter((provider) => {
          // Check if provider has expanded service relation
          const expandedServices = (provider as any).expand?.service;
          if (!expandedServices) return false;

          // Handle both array and single service cases
          const services = Array.isArray(expandedServices) ? expandedServices : [expandedServices];

          // Check if any service has matching title
          return services.some((service: any) =>
            service?.title?.toLowerCase() === serviceTitle.trim().toLowerCase()
          );
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
