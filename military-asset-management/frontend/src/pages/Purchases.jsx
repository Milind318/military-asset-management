import { useEffect, useState } from "react";
import {
  ShoppingCart,
  CheckCircle2
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Purchases() {
  const { user } = useAuth();

  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    baseId: user?.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    supplier: ""
  });

  const load = async () => {
    try {
      const [b, e, p] = await Promise.all([
        api.get("/assets/bases"),
        api.get("/assets/equipment"),
        api.get("/purchases")
      ]);

      setBases(b.data);
      setEquipment(e.data);
      setRows(p.data);
    } catch (error) {
      setMsg(
        error.response?.data?.message ||
          "Failed to load purchases"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await api.post("/purchases", form);

      setMsg("Purchase recorded successfully");

      setForm({
        ...form,
        quantity: "",
        supplier: ""
      });

      await load();
    } catch (x) {
      setMsg(
        x.response?.data?.message ||
          "Failed to record purchase"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <ShoppingCart />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Purchases
          </h1>

          <p className="text-slate-500 mt-1">
            Record newly acquired assets
          </p>
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl">
          <CheckCircle2 size={19} />
          {msg}
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm grid sm:grid-cols-2 gap-5"
      >
        <Select
          label="Base"
          value={form.baseId}
          disabled={user?.role === "BASE_COMMANDER"}
          onChange={(v) =>
            setForm({
              ...form,
              baseId: v
            })
          }
          options={bases}
        />

        <Select
          label="Equipment"
          value={form.equipmentTypeId}
          onChange={(v) =>
            setForm({
              ...form,
              equipmentTypeId: v
            })
          }
          options={equipment}
        />

        <Input
          label="Quantity"
          type="number"
          min="1"
          value={form.quantity}
          onChange={(v) =>
            setForm({
              ...form,
              quantity: v
            })
          }
        />

        <Input
          label="Supplier"
          value={form.supplier}
          onChange={(v) =>
            setForm({
              ...form,
              supplier: v
            })
          }
        />

        <div className="sm:col-span-2">
          <button
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {loading
              ? "Recording..."
              : "Record Purchase"}
          </button>
        </div>
      </form>

      <Table
        headers={[
          "Base",
          "Equipment",
          "Quantity",
          "Supplier",
          "Date"
        ]}
        rows={rows.map((r) => [
          r.base_name,
          r.equipment_name,
          r.quantity,
          r.supplier || "-",
          new Date(
            r.created_at
          ).toLocaleString()
        ])}
      />
    </div>
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
    <label className="text-sm font-medium">
      {label}

      <input
        required
        min={min}
        type={type}
        className="block w-full border border-slate-200 rounded-xl px-3 py-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
    <label className="text-sm font-medium">
      {label}

      <select
        required
        disabled={disabled}
        className="block w-full border border-slate-200 rounded-xl px-3 py-2.5 mt-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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

function Table({ headers, rows }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b">
        <h2 className="font-bold text-lg">
          Purchase History
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No purchases recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((h) => (
                  <th
                    className="text-left p-3 whitespace-nowrap"
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
                  className="border-t hover:bg-slate-50"
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