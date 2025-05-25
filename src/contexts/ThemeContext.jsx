
    import React, { createContext, useContext, useState, useEffect } from 'react';

    const ThemeContext = createContext();

    export const useTheme = () => useContext(ThemeContext);

    export const ThemeProvider = ({ children }) => {
      const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('pagoul-theme');
        if (storedTheme) {
          return storedTheme;
        }
        // Default to system preference if available, otherwise light
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      });

      useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('pagoul-theme', theme);
      }, [theme]);

      const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      };
      
      const setSpecificTheme = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
            if (newTheme === 'system') {
                const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setTheme(systemTheme);
            } else {
                setTheme(newTheme);
            }
        }
      }

      return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setSpecificTheme }}>
          {children}
        </ThemeContext.Provider>
      );
    };
  