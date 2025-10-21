import { useUser } from "@clerk/clerk-react";

export const useUserRole = () => {
  const { user, isLoaded } = useUser();

  // Get user role from publicMetadata or unsafeMetadata as fallback
  const role =
    user?.publicMetadata?.role ||
    user?.unsafeMetadata?.role ||
    "user";
  console.log(user?.publicMetadata,"publicMetadata");

  // Helper booleans for common role checks
  const isAdmin = role === "admin";
  const isUser = role === "user";

  return {
    role,
    isAdmin,
    isUser,
    isLoaded,
    user,
  };
};

