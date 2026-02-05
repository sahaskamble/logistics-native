import pb from "@/lib/pocketbase/pb";
import { UserContainer } from "../cfs/createOrder";
import { getCurrentUser } from "../users";
import { mergeFilters, type PbQueryOptions } from "../pbOptions";


// Fetch container by ID (with auth check)
export async function getContainerById(
  containerId: string,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: UserContainer | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = containerId?.trim();
    if (!id) {
      return { success: false, message: "Container ID is required.", output: null };
    }

    const container = await pb.collection("containers").getOne<UserContainer>(id, {
      ...options,
      expand: options?.expand || "ownedBy",
    });

    // Auth check: only owner can access
    if (container.ownedBy && container.ownedBy !== user.user.id) {
      return { success: false, message: "Not allowed to view this container.", output: null };
    }

    return { success: true, message: "Fetched container.", output: container };
  } catch (err: any) {
    console.error("Error fetching container", err);
    return { success: false, message: err?.message || "Failed to fetch container.", output: null };
  }
}

// Create new container
export async function createContainer(
  data: Partial<UserContainer>,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: UserContainer | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    // Set owner
    const createData = {
      ...data,
      ownedBy: user.user.id,
    };

    const newContainer = await pb.collection("containers").create<UserContainer>(createData, options as any);

    return { success: true, message: "Container created.", output: newContainer };
  } catch (err: any) {
    console.error("Error creating container", err);
    return { success: false, message: err?.message || "Failed to create container.", output: null };
  }
}

// Update container by ID
export async function updateContainer(
  containerId: string,
  data: Partial<UserContainer>,
  options?: PbQueryOptions
): Promise<{
  success: boolean;
  message: string;
  output: UserContainer | null;
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return { success: false, message: "User not authenticated.", output: null };
    }

    const id = containerId?.trim();
    if (!id) {
      return { success: false, message: "Container ID is required.", output: null };
    }

    // Fetch to check ownership
    const container = await pb.collection("containers").getOne<UserContainer>(id);
    if (container.ownedBy && container.ownedBy !== user.user.id) {
      return { success: false, message: "Not allowed to update this container.", output: null };
    }

    const updatedContainer = await pb.collection("containers").update<UserContainer>(id, data, options as any);

    return { success: true, message: "Container updated.", output: updatedContainer };
  } catch (err: any) {
    console.error("Error updating container", err);
    return { success: false, message: err?.message || "Failed to update container.", output: null };
  }
}

// Bulk delete containers (with auth check)
export async function deleteContainersBulk(containerIds: string[]): Promise<{
  success: boolean;
  message: string;
  output: { deleted: string[]; failed: { id: string; message: string }[] };
}> {
  try {
    const user = getCurrentUser();
    if (!user.isValid || !user.user?.id) {
      return {
        success: false,
        message: "User not authenticated.",
        output: { deleted: [], failed: [] },
      };
    }
    const userId = user.user.id;

    const ids = Array.from(new Set((containerIds || []).map((x) => x?.trim()).filter(Boolean))) as string[];
    if (ids.length === 0) {
      return { success: false, message: "No containers selected.", output: { deleted: [], failed: [] } };
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const container = await pb.collection("containers").getOne<UserContainer>(id);
          if (container.ownedBy && container.ownedBy !== userId) {
            return { ok: false as const, id, message: "Not allowed." };
          }
          await pb.collection("containers").delete(id);
          return { ok: true as const, id };
        } catch (e: any) {
          return { ok: false as const, id, message: e?.message || "Delete failed" };
        }
      })
    );

    const deleted = results.filter((r) => r.ok).map((r) => r.id);
    const failed = results
      .filter((r) => !r.ok)
      .map((r) => ({ id: r.id, message: (r as any).message || "Delete failed" }));

    if (failed.length > 0) {
      return {
        success: false,
        message: `Deleted ${deleted.length} container(s). Failed to delete ${failed.length} container(s).`,
        output: { deleted, failed },
      };
    }

    return {
      success: true,
      message: `Deleted ${deleted.length} container(s).`,
      output: { deleted, failed: [] },
    };
  } catch (err: any) {
    console.error("Error deleting containers", err);
    return {
      success: false,
      message: err?.message || "Failed to delete containers.",
      output: { deleted: [], failed: [] },
    };
  }
}
