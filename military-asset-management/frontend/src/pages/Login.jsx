import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] =
    useState("admin_user");

  const [password, setPassword] =
    useState("AdminPass123!");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_25%)]" />

      <form
        onSubmit={submit}
        className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/30">
            <Shield size={32} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-slate-900">
            Asset Command
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Military Asset Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}

        {/* Username */}
        <label className="text-sm font-semibold text-slate-700">
          Username

          <div className="relative mt-1.5 mb-4">
            <User
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              required
              className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />
          </div>
        </label>

        {/* Password */}
        <label className="text-sm font-semibold text-slate-700">
          Password

          <div className="relative mt-1.5 mb-6">
            <Lock
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              required
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

           <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
>
  {loading ? "Signing in..." : "Sign In"}
</button>
          </div>
        </label>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Demo accounts */}
        <div className="mt-6 bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 mb-2">
            Demo Credentials
          </p>

          <div className="space-y-1 text-xs text-slate-500">
            <p>
              <b>Admin:</b> admin_user / AdminPass123!
            </p>

            <p>
              <b>Commander:</b> commander_alpha /
              CommandPass123!
            </p>

            <p>
              <b>Logistics:</b> logistics_officer /
              LogisticsPass123!
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          Secure Operations Portal
        </p>
      </form>
    </div>
  );
}
