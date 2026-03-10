// src/App.jsx
//
// Root component of the RecycleChain frontend.
// Wraps the application in WalletProvider so all components
// have access to wallet state via context (Meta Open Source, 2024).

import { WalletProvider } from "./hooks/WalletContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    // WalletProvider makes wallet state available to all children
    <WalletProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        
        {/* Top navigation with wallet connection controls */}
        <Navbar />

        {/* Main content area */}
        <main>
          <Dashboard />
        </main>

      </div>
    </WalletProvider>
  );
};

export default App;