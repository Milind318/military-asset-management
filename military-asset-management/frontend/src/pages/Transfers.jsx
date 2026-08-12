import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Transfers() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    sourceBaseId: user?.baseId || "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: ""
  });

  const load = async () => {
    const [b, e, t] = await Promise.all([
      api.get("/assets/bases"),
      api.get("/assets/equipment"),
      api.get("/transfers")
    ]);

    setBases(b.data);
    setEquipment(e.data);
    setRows(t.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/transfers", form);
      setMsg("Transfer completed");
      setForm({ ...form, quantity: "" });
      load();
    } catch (x) {
      setMsg(x.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Base Transfers</h1>

      <form
        onSubmit={submit}
        className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4"
      >
        <Select
          label="Source Base"
          value={form.sourceBaseId}
          disabled={user.role === "BASE_COMMANDER"}
          onChange={(v) =>
            setForm({ ...form, sourceBaseId: v })
          }
          options={bases}
        />

        <Select
          label="Destination Base"
          value={form.destinationBaseId}
          onChange={(v) =>
            setForm({ ...form, destinationBaseId: v })
          }
          options={bases}
        />

        <Select
          label="Equipment"
          value={form.equipmentTypeId}
          onChange={(v) =>
            setForm({ ...form, equipmentTypeId: v })
          }
          options={equipment}
        />

        <Input
          label="Quantity"
          type="number"
          value={form.quantity}
          onChange={(v) =>
            setForm({ ...form, quantity: v })
          }
        />

        <div>
          <button className="bg-blue-600 text-white px-5 py-2 rounded">
            Complete Transfer
          </button>
          {msg && <p className="text-sm mt-2">{msg}</p>}
        </div>
      </form>

      <Table
        headers={[
          "From",
          "To",
          "Equipment",
          "Quantity",
          "Status",
          "Time"
        ]}
        rows={rows.map((r) => [
          r.source_base_name,
          r.destination_base_name,
          r.equipment_name,
          r.quantity,
          r.status,
          new Date(r.timestamp).toLocaleString()
        ])}
      />
    </div>
  );
}

function Input({ label, type, value, onChange }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        required
        type={type}
        className="block w-full border rounded p-2 mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select
        required
        disabled={disabled}
        className="block w-full border rounded p-2 mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}{o.category ? ` (${o.category})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="bg-white border rounded-xl overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th className="text-left p-3" key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr className="border-t" key={i}>
              {r.map((c, j) => (
                <td className="p-3" key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
