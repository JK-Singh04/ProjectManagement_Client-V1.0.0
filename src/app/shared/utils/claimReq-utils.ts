// claimReq-utils.ts
export const claimReq = {
  superAdminOnly: (claims: any) => claims.globalRole === 'SuperAdmin',

  // ✅ All logged-in users who are not super admin
  globalUserOnly: (claims: any) =>
    claims.globalRole === 'GlobalUser',

  // ✅ Project-level roles
  projectAdmin: (claims: any) =>
    claims.projectRoles?.includes('Administrator'),

  projectDeveloper: (claims: any) =>
    claims.projectRoles?.includes('Developer'),

  projectUser: (claims: any) =>
    claims.projectRoles?.includes('User'),

  // ✅ Any of the 3 project roles
  projectRolesOnly: (claims: any) =>
    claims.projectRoles?.some((role: string) =>
      ['Administrator', 'Developer', 'User'].includes(role)
    )
};
