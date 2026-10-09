import { FIELD_GROUPS, FieldKey, Service, ServiceField } from "@/lib/settings/datas";
import { useState } from "react";
import { Field, inputClass, Switch } from "../settings/ui";
import { ModalFooter } from "../modal/settingModal";
import { cn } from "@/lib/utils";


const toKey = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "");
const  ServiceForm=({
  service, existingKeys, onCancel, onSave,
}: {
  service: Service | null; existingKeys: string[]; onCancel: () => void; onSave: (d: Omit<Service, "id">) => void;
}) =>{
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [tags, setTags] = useState<string[]>(service?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [allowCustomName, setAllowCustomName] = useState(service?.allowCustomName ?? false);
  const [fields, setFields] = useState<ServiceField[]>(service?.fields ?? []);
  const [error, setError] = useState<string | null>(null);

  // The key is fixed once created, so existing customers keep matching their service
  const key = service?.key ?? toKey(name);
  const selected = (k: FieldKey) => fields.find((f) => f.key === k);

  const toggleField = (k: FieldKey) =>
    setFields((l) => (selected(k) ? l.filter((f) => f.key !== k) : [...l, { key: k, required: true }]));
  const toggleRequired = (k: FieldKey) =>
    setFields((l) => l.map((f) => (f.key === k ? { ...f, required: !f.required } : f)));

  const addTag = () => {
    const t = tagDraft.trim().replace(/,$/, "");
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagDraft("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return setError("Please enter a name.");
    if (existingKeys.includes(key)) return setError("A service with this name already exists.");
    // Keep fields in catalog order so the form always shows them consistently
    const order = FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
    onSave({
      key, name: name.trim(), description: description.trim(), tags, allowCustomName,
      active: service?.active ?? true,
      fields: [...fields].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-5 px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="svcName" hint={key ? `Code: ${key}` : undefined}>
            <input id="svcName" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
          </Field>
          <Field label="Tags" htmlFor="svcTags" hint="Press Enter to add">
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-gray-300 px-2 py-1.5 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
                </span>
              ))}
              <input
                id="svcTags"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                  else if (e.key === "Backspace" && !tagDraft) setTags(tags.slice(0, -1));
                }}
                onBlur={addTag}
                className="min-w-20 flex-1 text-sm outline-none"
              />
            </div>
          </Field>
          <Field label="Description" htmlFor="svcDesc" className="sm:col-span-2">
            <textarea id="svcDesc" rows={2} className={`${inputClass} h-auto py-2`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
          </Field>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
          <Switch checked={allowCustomName} onChange={setAllowCustomName} label="Customer types the service name" />
          <span className="text-sm">
            <span className="font-medium text-gray-800">Customer types the service name</span>
            <span className="block text-gray-500">For a catch-all like “Other services”.</span>
          </span>
        </label>

        <div>
          <p className="text-sm font-medium text-gray-800">Fields to ask for</p>
          <p className="text-xs text-gray-500">Name, email and phone are always asked. Tick the extra fields, then mark optional ones.</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {FIELD_GROUPS.map((g) => (
              <fieldset key={g.group} className="rounded-lg border border-gray-200 p-3">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{g.group}</legend>
                <ul className="space-y-2">
                  {g.fields.map((f) => {
                    const sel = selected(f.key);
                    return (
                      <li key={f.key} className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" className="h-4 w-4 accent-primary" checked={!!sel} onChange={() => toggleField(f.key)} />
                          {f.label}
                        </label>
                        {sel && (
                          <button type="button" onClick={() => toggleRequired(f.key)} className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", sel.required ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500")}>
                            {sel.required ? "Required" : "Optional"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
      <ModalFooter>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{service ? "Save changes" : "Create service"}</button>
      </ModalFooter>
    </form>
  );
}
export default ServiceForm