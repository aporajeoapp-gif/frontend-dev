
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Super Admin bypasses all checks
  if (user.role === 'super_admin') return true;
  
  
  
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissions.includes(permission) || permissions.includes('*');
};


export const canAccessResource = (user, resource) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (permissions.includes('*')) return true;
  
  return permissions.some(p => p.startsWith(`${resource}.`));
};
