// client/src/App.jsx
import AppRoutes from "./shared/routes/AppRoutes";
import { PlayerProvider } from "./features/player/context/PlayerContext";

import { ToastProvider } from "./shared/context/ToastContext";


function App() {
  return (
    <ToastProvider>
      <PlayerProvider>
        <AppRoutes />
      </PlayerProvider>
    </ToastProvider>
  );
}

export default App;
