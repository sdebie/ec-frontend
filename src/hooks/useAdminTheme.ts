import { useContext } from 'react';
import { AdminThemeContext } from '../context/AdminThemeContext';

export function useAdminTheme() {

  const context = useContext(AdminThemeContext);

  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }

  return context;
}
