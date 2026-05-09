import AppRoutes from "./routes/AppRoutes";
import { PlayerProvider } from "./context/PlayerContext";
import "./styles/player.css";

function App() {
  return (
    <PlayerProvider>
      <AppRoutes />
    </PlayerProvider>
  );
}

export default App;