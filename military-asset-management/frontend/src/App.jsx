import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import Operations from "./pages/Operations";

function Protected() {
  const { user } = useAuth();
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/operations" element={<Operations />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
