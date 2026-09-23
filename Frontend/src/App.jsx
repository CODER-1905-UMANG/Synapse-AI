import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  lazy,
  Suspense,
  useContext,
} from "react";

import { Toaster } from "react-hot-toast";

// Context
import { MyProvider } from "./context/MyContext";
import { MyContext } from "./context/MyContextDefinition";

// Global Layout
import AppLayout from "./components/layout/AppLayout";

// ======================================================
// LAZY-LOADED PAGES
// ======================================================

const Home = lazy(
  () => import("./pages/Home/Home")
);

const AuthForm = lazy(
  () => import("./pages/Auth/Auth")
);

const ChatWindow = lazy(
  () => import("./pages/Chat/ChatWindow")
);

const Settings = lazy(
  () => import("./pages/Settings/Settings")
);

const ChangePassword = lazy(
  () => import("./pages/Settings/ChangePassword")
);

const ResetPassword = lazy(
  () => import("./pages/Settings/ResetPassword")
);

const ImagifyHome = lazy(
  () => import("./pages/Imagify/ImagifyHome")
);

const VoiceHome = lazy(
  () => import("./pages/Voice/VoiceHome")
);

const Summarizer = lazy(
  () => import("./pages/Summarizer/Summarizer")
);

const Resume = lazy(
  () => import("./pages/Resume/Resume")
);

// ======================================================
// LOADING SCREEN
// ======================================================

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />

          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-500" />
        </div>

        <p className="text-sm text-gray-500">
          Loading Synapse AI...
        </p>
      </div>
    </div>
  );
};

// ======================================================
// PROTECTED ROUTE
// ======================================================

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(MyContext);

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return children;
};

// ======================================================
// SIMPLE WRAPPER
// ======================================================

const SimpleWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
};

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <MyProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#111116",
              color: "#fff",
              border:
                "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ==================================================
                PUBLIC HOME
                ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* ==================================================
                AUTH
                ================================================== */}

            <Route
              path="/auth"
              element={
                <SimpleWrapper>
                  <AuthForm />
                </SimpleWrapper>
              }
            />

            {/* ==================================================
                PASSWORD RESET
                Public route
                ================================================== */}

            <Route
              path="/reset-password/:token"
              element={
                <SimpleWrapper>
                  <ResetPassword />
                </SimpleWrapper>
              }
            />

            {/* ==================================================
                MAIN AI CHAT
                Uses its own special chat sidebar
                ================================================== */}

            <Route
              path="/main"
              element={
                <SimpleWrapper>
                  <ProtectedRoute>
                    <ChatWindow />
                  </ProtectedRoute>
                </SimpleWrapper>
              }
            />

            {/* ==================================================
                IMAGE STUDIO
                ================================================== */}

            <Route
              path="/imagify"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ImagifyHome />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                VOICE AI
                ================================================== */}

            <Route
              path="/voicefy"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VoiceHome />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                AI SUMMARIZER
                ================================================== */}

            <Route
              path="/summarizer"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Summarizer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                RESUME ANALYZER
                ================================================== */}

            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Resume />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                SETTINGS
                ================================================== */}

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                CHANGE PASSWORD
                ================================================== */}

            <Route
              path="/settings/password"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChangePassword />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                FALLBACK
                ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </Suspense>
      </Router>
    </MyProvider>
  );
}

export default App;