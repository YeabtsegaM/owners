export function formatRole(role: string): string {
  switch (role) {
    case 'shop_owner':
      return 'Shop Owner';
    case 'admin':
      return 'Administrator';
    case 'cashier':
      return 'Cashier';
    case 'system_admin':
      return 'System Administrator';
    default:
      // Convert snake_case to Title Case
      return role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}
