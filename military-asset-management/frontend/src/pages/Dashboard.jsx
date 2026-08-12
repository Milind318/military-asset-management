import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  TrendingUp,
  Boxes,
  Activity,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

import api from "../services/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [m, i] = await Promise.all([
        api.get("/assets/dashboard"),
        api.get("/assets/inventory"),
      ]);

      setMetrics(m.data);
      setInventory(Array.isArray(i.data) ? i.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*
   * Movement data
   */
  const movementData = useMemo(
    () => [
      {
        name: "Purchases",
        value: Number(metrics?.purchases || 0),
      },
      {
        name: "Transfers In",
        value: Number(metrics?.transfersIn || 0),
      },
      {
        name: "Transfers Out",
        value: Number(metrics?.transfersOut || 0),
      },
      {
        name: "Assigned",
        value: Number(metrics?.assigned || 0),
      },
      {
        name: "Expended",
        value: Number(metrics?.expended || 0),
      },
    ],
    [metrics]
  );

  /*
   * Inventory chart
   */
  const inventoryData = useMemo(() => {
    return inventory
      .map((item) => ({
        name: item.name || "Unknown",
        quantity: Number(item.quantity || 0),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  }, [inventory]);

  /*
   * Inventory distribution
   */
  const inventoryPieData = useMemo(() => {
    return inventory
      .map((item) => ({
        name: item.name || "Unknown",
        value: Number(item.quantity || 0),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [inventory]);

  /*
   * Trend-style chart from current movement values.
   * This does not require any new backend endpoint.
   */
  const trendData = useMemo(
    () => [
      {
        name: "Opening",
        value: Number(metrics?.openingBalance || 0),
      },
      {
        name: "Purchases",
        value: Number(metrics?.purchases || 0),
      },
      {
        name: "Transfers In",
        value: Number(metrics?.transfersIn || 0),
      },
      {
        name: "Assigned",
        value: Number(metrics?.assigned || 0),
      },
      {
        name: "Expended",
        value: Number(metrics?.expended || 0),
      },
      {
        name: "Closing",
        value: Number(metrics?.closingBalance || 0),
      },
    ],
    [metrics]
  );

  const totalInventory = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const lowStockItems = inventory.filter(
    (item) => Number(item.quantity || 0) < 10
  );

  const colors = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-500 font-medium">
            Loading command dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-4">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-slate-500 mt-2 break-words">
            {error}
          </p>

          <button
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-7 shadow-xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-slate-200 mb-3">
              <Activity size={14} />
              LIVE OPERATIONS
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Operations Dashboard
            </h1>

            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Welcome back,{" "}
              <span className="font-semibold text-white">
                {user?.username}
              </span>
              .
            </p>

            <div className="mt-3 inline-flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Role: {user?.role}
            </div>
          </div>

          <button
            onClick={load}
            className="self-start lg:self-center inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition text-sm font-medium"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={Boxes}
          iconColor="blue"
          sub="Initial asset balance"
        />

        <StatCard
          title="Net Movement"
          value={metrics.netMovement}
          icon={TrendingUp}
          iconColor="green"
          sub="View movement breakdown"
          onClick={() => setShow(true)}
        />

        <StatCard
          title="Expended"
          value={metrics.expended}
          icon={ArrowUpFromLine}
          iconColor="red"
          sub="Total assets expended"
        />

        <StatCard
          title="Closing Balance"
          value={metrics.closingBalance}
          icon={Package}
          iconColor="purple"
          sub="Current calculated balance"
        />
      </section>

      {/* Secondary stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownToLine size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Purchases</p>
              <p className="text-xl font-bold text-slate-900">
                {metrics.purchases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownToLine size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Transfers In</p>
              <p className="text-xl font-bold text-slate-900">
                {metrics.transfersIn}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ArrowUpFromLine size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Transfers Out</p>
              <p className="text-xl font-bold text-slate-900">
                {metrics.transfersOut}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardCheck size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Assigned</p>
              <p className="text-xl font-bold text-slate-900">
                {metrics.assigned}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main charts */}
      <section className="grid xl:grid-cols-3 gap-6">
        {/* Movement */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Asset Movement
              </h2>

              <p className="text-sm text-slate-500">
                Current operational activity
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Quantity
            </div>
          </div>

          <div className="h-[280px] sm:h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={movementData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={55}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-slate-900">
              Inventory Mix
            </h2>

            <p className="text-sm text-slate-500">
              Top equipment distribution
            </p>
          </div>

          {inventoryPieData.length > 0 ? (
            <>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {inventoryPieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {inventoryPieData.slice(0, 5).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            colors[index % colors.length],
                        }}
                      />

                      <span className="truncate text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-semibold text-slate-900 ml-2">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              No inventory data available
            </div>
          )}
        </div>
      </section>

      {/* Trend + inventory */}
      <section className="grid xl:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg text-slate-900">
              Balance Overview
            </h2>

            <p className="text-sm text-slate-500">
              Movement from opening to closing balance
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="balanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Current Inventory
              </h2>

              <p className="text-sm text-slate-500">
                Highest quantity assets
              </p>
            </div>

            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
              Total: {totalInventory}
            </div>
          </div>

          {inventoryData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />

                  <Bar
                    dataKey="quantity"
                    fill="#16a34a"
                    radius={[0, 7, 7, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              No inventory available
            </div>
          )}
        </div>
      </section>

      {/* Low stock */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Inventory Status
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Monitor available equipment
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                lowStockItems.length > 0
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {lowStockItems.length > 0
                ? `${lowStockItems.length} Low Stock`
                : "Stock Healthy"}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {inventory.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              No inventory records found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.slice(0, 9).map((item) => {
                const quantity = Number(item.quantity || 0);
                const isLow = quantity < 10;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition hover:shadow-sm ${
                      isLow
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isLow
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Package size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            Available stock
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-lg font-bold ${
                          isLow ? "text-red-600" : "text-slate-900"
                        }`}
                      >
                        {quantity}
                      </span>
                    </div>

                    {isLow && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-red-600">
                        <AlertTriangle size={13} />
                        Low stock
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Movement modal */}
      {show && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Net Movement
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Detailed asset movement breakdown
                </p>
              </div>

              <button
                onClick={() => setShow(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <MovementRow
                label="Purchases"
                value={metrics.purchases}
                icon={ArrowDownToLine}
                color="blue"
              />

              <MovementRow
                label="Transfers In"
                value={`+${metrics.transfersIn}`}
                icon={ArrowDownToLine}
                color="green"
              />

              <MovementRow
                label="Transfers Out"
                value={`-${metrics.transfersOut}`}
                icon={ArrowUpFromLine}
                color="red"
              />

              <MovementRow
                label="Assigned"
                value={metrics.assigned}
                icon={ClipboardCheck}
                color="purple"
              />

              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    Total Net Movement
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    {metrics.netMovement}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShow(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MovementRow({ label, value, icon: Icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles[color]}`}
        >
          <Icon size={17} />
        </div>

        <span className="font-medium text-slate-700">{label}</span>
      </div>

      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}