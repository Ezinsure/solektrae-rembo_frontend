"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Field, inputClass, Switch } from "../settings/ui";
import { ModalFooter } from "../modal/settingModal";
import { cn } from "@/lib/utils";
import { useServiceFields } from "@/hooks/useServices";

const toKey = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const ServiceForm = ({ service, existingKeys = [], saving = false, onCancel, onSave }: any) => {
  const { data: catalog, isLoading: catalogLoading, isError: catalogError } = useServiceFields();

  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [tags, setTags] = useState<string[]>(service?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [allowCustomName, setAllowCustomName] = useState(service?.allowCustomName ?? false);
  const [fields, setFields] = useState<any[]>(service?.fields ?? []);
  const [error, setError] = useState<string | null>(null);

  // The key is fixed once created, so existing customers keep matching their service
  const key = service?.key ?? toKey(name);

  // Catalog fields grouped for the 3 columns (Family / Personal / Address)
  const groups = useMemo(
    () =>
      (catalog?.groups ?? []).map((g: any) => ({
        ...g,
        fields: (catalog?.fields ?? []).filter((f: any) => f.group === g.key),
      })),
    [catalog],
  );
  const catalogOrder = useMemo(() => (catalog?.fields ?? []).map((f: any) => f.key), [catalog]);

  const selected = (k: string) => fields.find((f) => f.key === k);

  const toggleField = (k: string) =>
    setFields((l) => (selected(k) ? l.filter((f) => f.key !== k) : [...l, { key: k, required: true }]));

  const toggleRequired = (k: string) =>
    setFields((l) => l.map((f) => (f.key === k ? { ...f, required: !f.required } : f)));

  const addTag = () => {
    const t = tagDraft.trim().replace(/,$/, "").slice(0, 30);
    if (t && tags.length < 20 && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagDraft("");
  };

  const submit = (e: any) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) return setError("Please enter a name.");
    if (!service && existingKeys.includes(key)) return setError("A service with a similar name already exists.");

    onSave({
      name: name.trim(),
      description: description.trim(),
      tags,
      allowCustomName,
      active: service?.active ?? true,
      // Keep fields in catalog order so the customer form always shows them consistently
      fields: [...fields]
        .filter((f) => catalogOrder.includes(f.key)) // drop fields no longer in the catalog
        .sort((a, b) => catalogOrder.indexOf(a.key) - catalogOrder.indexOf(b.key)),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-5 px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="svcName" hint={key ? `Code: ${key}` : undefined}>
            <input
              id="svcName"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={60}
              disabled={saving}
            />
          </Field>

          <Field label="Tags" htmlFor="svcTags" hint="Press Enter to add">
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-gray-300 px-2 py-1.5 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))} disabled={saving}>×</button>
                </span>
              ))}
              <input
                id="svcTags"
                value={tagDraft}
                maxLength={30}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                  else if (e.key === "Backspace" && !tagDraft) setTags(tags.slice(0, -1));
                }}
                onBlur={addTag}
                disabled={saving}
                className="min-w-20 flex-1 text-sm outline-none"
              />
            </div>
          </Field>

          <Field label="Description" htmlFor="svcDesc" className="sm:col-span-2">
            <textarea
              id="svcDesc"
              rows={2}
              className={`${inputClass} h-auto py-2`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              disabled={saving}
            />
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

          {catalogLoading ? (
            <div className="mt-3 flex h-24 items-center justify-center text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : catalogError ? (
            <p className="mt-3 text-sm text-red-600">Could not load the fields. Please try again.</p>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {groups.map((g: any) => (
                <fieldset key={g.key} className="rounded-lg border border-gray-200 p-3">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{g.label}</legend>
                  <ul className="space-y-2">
                    {g.fields.map((f: any) => {
                      const sel = selected(f.key);
                      return (
                        <li key={f.key} className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-primary"
                              checked={!!sel}
                              onChange={() => toggleField(f.key)}
                              disabled={saving}
                            />
                            {f.label?.en ?? f.key}
                          </label>
                          {sel && (
                            <button
                              type="button"
                              onClick={() => toggleRequired(f.key)}
                              disabled={saving}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                                sel.required ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500",
                              )}
                            >
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
          )}
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>

      <ModalFooter>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving || catalogLoading}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {service ? "Save changes" : "Create service"}
        </button>
      </ModalFooter>
    </form>
  );
};

export default ServiceForm;