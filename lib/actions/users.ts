import pb from "../pocketbase/pb";

export function getCurrentUser() {
  return {
    user: pb.authStore.record,
    isValid: pb.authStore.isValid,
  };
}
