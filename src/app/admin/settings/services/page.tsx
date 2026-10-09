"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Modal, { ConfirmModal} from "@/components/modal/settingModal";
import { EmptyState,  PageHeader, Pill, Switch, inputClass } from "@/components/settings/ui";
import { fieldLabel, sampleServices, type Service, } from "@/lib/settings/datas";
import { cn } from "@/lib/utils";
import ServiceForm from "@/components/forms/servicesForm";


const ServicesPage=()=> {
  const [services, setServices] = useState<Service[]>(sampleServices); // TODO: load from API
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => !q || `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(q));
  }, [services, query]);

  const save = (data: Omit<Service, "id">) => {
    if (editing) setServices((l) => l.map((s) => (s.id === editing.id ? { ...s, ...data } : s)));
    else setServices((l) => [...l, { ...data, id: crypto.randomUUID() }]);
    setFormOpen(false);
  };

  const toggleActive = (id: string, active: boolean) =>
    setServices((l) => l.map((s) => (s.id === id ? { ...s, active } : s))); // TODO: API

  return (
    <div>
      <PageHeader
        title="Services"
        description="Services customers can choose, and the information each one asks for."
        action={<button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> New service</button>}
      />

      <label className="relative mt-6 block">
        <span className="sr-only">Search services</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or tag" className={`${inputClass} pl-9`} />
      </label>

      {filtered.length === 0 ? (
        <div className="mt-6"><EmptyState title="No services found" /></div>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200">
          {filtered.map((s) => (
            <li key={s.id} className={cn("flex flex-col gap-4 p-5 sm:flex-row sm:items-start", !s.active && "bg-gray-50/70")}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={cn("font-semibold", s.active ? "text-gray-900" : "text-gray-500")}>{s.name}</h3>
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{s.key}</code>
                  {!s.active && <Pill>Hidden</Pill>}
                  {s.allowCustomName && <Pill tone="amber">Custom name</Pill>}
                </div>
                <p className="mt-1 text-sm text-gray-500">{s.description}</p>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{s.fields.length} fields: </span>
                  {s.fields.map((f) => fieldLabel(f.key) + (f.required ? "" : " (optional)")).join(", ") || "none"}
                </p>
                {s.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">{s.tags.map((t) => <Pill key={t} tone="primary">{t}</Pill>)}</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <Switch checked={s.active} onChange={(v) => toggleActive(s.id, v)} label={`Show ${s.name} on the form`} />
                  <span className="sm:hidden lg:inline">{s.active ? "Active" : "Hidden"}</span>
                </label>
                <div className="flex gap-1">
                  <button className="icon-btn" aria-label={`Edit ${s.name}`} onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
                  <button className="icon-btn hover:text-red-600" aria-label={`Delete ${s.name}`} onClick={() => setDeleting(s)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} size="lg" title={editing ? "Edit service" : "New service"} description="Choose which information customers must give for this service.">
        {formOpen && <ServiceForm key={editing?.id ?? "new"} service={editing} existingKeys={services.filter((s) => s.id !== editing?.id).map((s) => s.key)} onCancel={() => setFormOpen(false)} onSave={save} />}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete service?"
        message={<>Customers already registered for <strong>{deleting?.name}</strong> keep their data. Consider hiding it instead.</>}
        onConfirm={() => setServices((l) => l.filter((s) => s.id !== deleting?.id))}
      />
    </div>
  );
}
export default ServicesPage

