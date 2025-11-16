// Theme loader utility - runs once on app initialization
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserPreferences } from '../services/resourceService';

let themeInitialized = false;

export const initializeTheme = () => {
  // Only run once
  if (themeInitialized) return;
  themeInitialized = true;

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Load theme as soon as user auth state is known
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const prefs = await getUserPreferences(user.uid);
        applyTheme(prefs.theme);
      } catch (err) {
        console.error('Error loading theme:', err);
        applyTheme('dark'); // Fallback to dark theme
      }
    } else {
      // No user, apply default theme
      applyTheme('dark');
    }
  });
};
