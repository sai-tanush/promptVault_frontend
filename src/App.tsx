import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import { Toaster as SonnerToaster } from "./components/ui/sonner";
import { RegisterPage } from "./components/RegisterPage";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <SonnerToaster richColors position="top-right" />
    </>
  );
}

export default App;
