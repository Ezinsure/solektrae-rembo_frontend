"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/modal/settingModal";
import { EmptyState, PageHeader, Pill, Switch, inputClass } from "@/components/settings/ui";
import { cn } from "@/lib/utils";
import ServiceForm from "@/components/forms/servicesForm";
import {
  useCreateService,
  useDeleteService,
  useServiceFields,
  useServices,
  useToggleService,
  useUpdateService,
} from "@/hooks/useServices";

// Only what the backend accepts (it rejects unknown fields like id or key)
const toPayload = (d: any) => {
  const payload: any = {
    name: d.name?.trim(),
    description: d.description?.trim() || null,
    tags: d.tags ?? [],
    allowCustomName: !!d.allowCustomName,
    fields: (d.fields ?? []).map((f: any) => ({ key: f.key, required: !!f.required })),
  };
  if (typeof d.active === "boolean") payload.active = d.active;
  return payload;
};

const ServicesPage = () => {
  const { data: services = [], isLoading, isError } = useServices({ includeInactive: true });
  const { data: catalog } = useServiceFields();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const toggleService = useToggleService();
  const deleteService = useDeleteService();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);

  const saving = createService.isPending || updateService.isPending;

  // Field key → English label, from the backend catalog
  const fieldLabel = useMemo(() => {
    const labels = new Map((catalog?.fields ?? []).map((f: any) => [f.key, f.label?.en ?? f.key]));
    return (key: string) => (labels.get(key) as string) ?? key;
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s: any) => !q || `${s.name} ${s.description ?? ""} ${(s.tags ?? []).join(" ")}`.toLowerCase().includes(q),
    );
  }, [services, query]);

  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };

  const save = (data: any) => {
    const done = { onSuccess: () => setFormOpen(false) };
    if (editing) updateService.mutate({ id: editing.id, data: toPayload(data) }, done);
    else createService.mutate(toPayload(data), done);
  };

  const toggleActive = (id: string, active: boolean) => toggleService.mutate({ id, active });

  const confirmDelete = () => {
    if (!deleting) return;
    deleteService.mutate(deleting.id, { onSettled: () => setDeleting(null) });
  };

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

      {isLoading ? (
        <div className="mt-6 flex h-40 items-center justify-center text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="mt-6 text-sm text-red-600">Could not load services. Please refresh the page.</p>
      ) : filtered.length === 0 ? (
        <div className="mt-6"><EmptyState title={services.length === 0 ? "No services yet" : "No services found"} /></div>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200">
          {filtered.map((s: any) => {
            const toggling = toggleService.isPending && toggleService.variables?.id === s.id;
            const tags = s.tags ?? [];
            return (
              <li key={s.id} className={cn("flex flex-col gap-4 p-5 sm:flex-row sm:items-start", !s.active && "bg-gray-50/70")}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={cn("font-semibold", s.active ? "text-gray-900" : "text-gray-500")}>{s.name}</h3>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{s.key}</code>
                    {!s.active && <Pill>Hidden</Pill>}
                    {s.allowCustomName && <Pill tone="amber">Custom name</Pill>}
                  </div>
                  {s.description && <p className="mt-1 text-sm text-gray-500">{s.description}</p>}
                  <p className="mt-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{s.fields.length} fields: </span>
                    {s.fields.map((f: any) => fieldLabel(f.key) + (f.required ? "" : " (optional)")).join(", ") || "none"}
                  </p>
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((t: string) => <Pill key={t} tone="primary">{t}</Pill>)}</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <label className={cn("flex items-center gap-2 text-sm text-gray-600", toggling && "opacity-60")}>
                    <Switch
                      checked={s.active}
                      onChange={(v: boolean) => !toggling && toggleActive(s.id, v)}
                      label={`Show ${s.name} on the form`}
                    />
                    <span className="sm:hidden lg:inline">{s.active ? "Active" : "Hidden"}</span>
                  </label>
                  <div className="flex gap-1">
                    <button className="icon-btn" aria-label={`Edit ${s.name}`} onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
                    <button className="icon-btn hover:text-red-600" aria-label={`Delete ${s.name}`} onClick={() => setDeleting(s)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={formOpen} onClose={closeForm} size="lg" title={editing ? "Edit service" : "New service"} description="Choose which information customers must give for this service.">
        {formOpen && (
          <ServiceForm
            key={editing?.id ?? "new"}
            service={editing}
            existingKeys={services.filter((s: any) => s.id !== editing?.id).map((s: any) => s.key)}
            saving={saving}
            onCancel={closeForm}
            onSave={save}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => !deleteService.isPending && setDeleting(null)}
        title="Delete service?"
        message={<>Customers already registered for <strong>{deleting?.name}</strong> keep their data. Consider hiding it instead.</>}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ServicesPage;