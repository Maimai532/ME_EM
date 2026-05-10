// client/src/App.jsx
import AppRoutes from "./routes/AppRoutes";
import { PlayerProvider } from "./context/PlayerContext";
import "./styles/player.css";

import { ToastProvider } from "./context/ToastContext";

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
