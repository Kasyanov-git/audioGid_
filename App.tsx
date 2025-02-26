import React, { useEffect } from 'react';
import { setupPlayer } from './setupPlayer';
import Navigate from './Navigate';

const App: React.FC = () => {
  useEffect(() => {
    setupPlayer().then(() => {
      console.log('Player is ready');
    });
  }, []);

  return <Navigate />;
};

export default App;