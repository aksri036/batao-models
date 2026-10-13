export type OpsRole = "sales" | "support" | "superadmin";

// Doc at /admin/admin-gods/admin-numbers/{phone} — the existing login allowlist,
// extended with team-roster fields for the Ops Command Center.
export interface AdminMember {
  phone: string;
  name?: string;
  email?: string;
  role?: OpsRole; // missing => treated as full-access (backward compatible with pre-existing admins)
  active?: boolean;
}
