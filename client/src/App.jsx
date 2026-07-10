// client/src/App.jsx
import AppRoutes from "./shared/routes/AppRoutes";
import { PlayerProvider } from "./features/player/context/PlayerContext";

import { ToastProvider } from "./shared/context/ToastContext";
import { PlaylistProvider } from "./features/playlist/context/PlaylistContext";

function App() {
  return (
    <ToastProvider>
      <PlaylistProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </PlaylistProvider>
    </ToastProvider>
  );
}

export default App;
