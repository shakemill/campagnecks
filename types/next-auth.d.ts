import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/types/domain";

declare module "next-auth" {
  interface User {
    role: UserRole;
    campaignId: string;
    mustChangePassword: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      campaignId: string;
      mustChangePassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    campaignId?: string;
    mustChangePassword?: boolean;
  }
}
