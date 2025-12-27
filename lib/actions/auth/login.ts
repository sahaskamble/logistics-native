import pb from "@/lib/pocketbase/pb";

export async function Login(UsernameOrEmail: string, password: string) {
  try {
    const identity = UsernameOrEmail;
    const response = await pb.collection('users').authWithPassword(identity, password);
    return {
      success: true,
      output: response,
    };
  } catch (err) {
    console.error("Erron Login UnSuccessfull", err);
    return {
      success: false,
      output: err,
    };
  }
}
