import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  PackageMinus
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Operations() {
  const { user } = useAuth();

  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [assign, setAssign] = useState([]);
  const [exp, setExp] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [a, setA] = useState({
    baseId: user?.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    personnelName: "",
    purpose: ""
  });

  const [x, setX] = useState({
    baseId: user?.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    reason: ""
  });

  const load = async () => {
    try {
      const [b, e, aa, xx] = await Promise.all([
        api.get("/assets/bases"),
        api.get("/assets/equipment"),
        api.get("/operations/assignments"),
        api.get("/operations/expenditures")
      ]);

      setBases(b.data);
      setEquipment(e.data);
      setAssign(aa.data);
      setExp(xx.data);
    } catch (error) {
      setMsg(
        error.response?.data?.message ||
          "Failed to load operations"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/operations/assignments", a);

      setMsg("Assignment recorded successfully");

      setA({
        ...a,
        quantity: "",
        personnelName: "",
        purpose: ""
      });

      await load();
    } catch (z) {
      setMsg(
        z.response?.data?.message ||
          "Failed to record assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitX = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/operations/expenditures", x);

      setMsg("Expenditure recorded successfully");

      setX({
        ...x,
        quantity: "",
        reason: ""
      });

      await load();
    } catch (z) {
      setMsg(
        z.response?.data?.message ||
          "Failed to record expenditure"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <ClipboardCheck />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Operations
            </h1>

            <p className="text-slate-500 mt-1">
              Manage asset assignments and expenditures
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl">
          <CheckCircle2 size={20} />
          <span>{msg}</span>
        </div>
      )}

      {/* Forms */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Form
          title="Assign Asset"
          description="Assign equipment to personnel"
          icon={<ClipboardCheck size={20} />}
          color="blue"
          onSubmit={submitA}
        >
          <Select
            label="Base"
            value={a.baseId}
            disabled={user?.role === "BASE_COMMANDER"}
            onChange={(v) =>
              setA({ ...a, baseId: v })
            }
            options={bases}
          />

          <Select
            label="Equipment"
            value={a.equipmentTypeId}
            onChange={(v) =>
              setA({
                ...a,
                equipmentTypeId: v
              })
            }
            options={equipment}
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={a.quantity}
            onChange={(v) =>
              setA({ ...a, quantity: v })
            }
          />

          <Input
            label="Personnel"
            value={a.personnelName}
            onChange={(v) =>
              setA({
                ...a,
                personnelName: v
              })
            }
          />

          <Input
            label="Purpose"
            value={a.purpose}
            onChange={(v) =>
              setA({
                ...a,
                purpose: v
              })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Processing..." : "Assign Asset"}
          </button>
        </Form>

        <Form
          title="Record Expenditure"
          description="Record assets consumed or expended"
          icon={<PackageMinus size={20} />}
          color="red"
          onSubmit={submitX}
        >
          <Select
            label="Base"
            value={x.baseId}
            disabled={user?.role === "BASE_COMMANDER"}
            onChange={(v) =>
              setX({ ...x, baseId: v })
            }
            options={bases}
          />

          <Select
            label="Equipment"
            value={x.equipmentTypeId}
            onChange={(v) =>
              setX({
                ...x,
                equipmentTypeId: v
              })
            }
            options={equipment}
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={x.quantity}
            onChange={(v) =>
              setX({ ...x, quantity: v })
            }
          />

          <Input
            label="Reason"
            value={x.reason}
            onChange={(v) =>
              setX({
                ...x,
                reason: v
              })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading
              ? "Processing..."
              : "Record Expenditure"}
          </button>
        </Form>
      </div>

      <Table
        title="Assignment History"
        headers={[
          "Base",
          "Equipment",
          "Qty",
          "Personnel",
          "Purpose"
        ]}
        rows={assign.map((r) => [
          r.base_name,
          r.equipment_name,
          r.quantity,
          r.personnel_name,
          r.purpose || "-"
        ])}
      />

      <Table
        title="Expenditure History"
        headers={[
          "Base",
          "Equipment",
          "Qty",
          "Reason",
          "Date"
        ]}
        rows={exp.map((r) => [
          r.base_name,
          r.equipment_name,
          r.quantity,
          r.reason || "-",
          new Date(r.created_at).toLocaleString()
        ])}
      />
    </div>
  );
}

function Form({
  title,
  description,
  icon,
  color,
  children,
  onSubmit
}) {
  const styles =
    color === "red"
      ? "bg-red-100 text-red-600"
      : "bg-blue-100 text-blue-600";

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-3 rounded-xl ${styles}`}>
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-lg">{title}</h2>
          <p className="text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </form>
  );
}

function Input({
  label,
  type = "text",
  min,
  value,
  onChange
}) {
  return (
    <label className="text-sm font-medium block">
      {label}

      <input
        required
        min={min}
        type={type}
        className="block w-full border border-slate-200 rounded-xl px-3 py-2.5 mt-1.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled
}) {
  return (
    <label className="text-sm font-medium block">
      {label}

      <select
        required
        disabled={disabled}
        className="block w-full border border-slate-200 rounded-xl px-3 py-2.5 mt-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">Select {label}</option>

        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
            {o.category
              ? ` (${o.category})`
              : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function Table({ title, headers, rows }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b">
        <h2 className="font-bold text-lg">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No records available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((h) => (
                  <th
                    className="text-left p-3 whitespace-nowrap font-semibold text-slate-600"
                    key={h}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr
                  className="border-t hover:bg-slate-50 transition"
                  key={i}
                >
                  {r.map((c, j) => (
                    <td
                      className="p-3 whitespace-nowrap"
                      key={j}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}