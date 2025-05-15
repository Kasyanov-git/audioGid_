import React, { useEffect } from 'react';
import { setupPlayer } from './setupPlayer';
import Navigate from './Navigate';
import { ThemeProvider } from './ThemeContext';

const App: React.FC = () => {
  useEffect(() => {
    setupPlayer().then(() => {
      console.log('Player is ready');
    });
  }, []);

  return (
    <ThemeProvider>
      <Navigate />
    </ThemeProvider>
  );
};

export default App;