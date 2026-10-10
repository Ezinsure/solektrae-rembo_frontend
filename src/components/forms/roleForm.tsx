"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Field, inputClass } from "../settings/ui";
import { ModalFooter } from "../modal/settingModal";

const ACCESS_LEVELS = [
  { value: "admin", label: "Admin", description: "Oversees system operations, user access, and administrative settings." },
  { value: "hr", label: "HR", description: "Manages employee records, staff administration, and human resource operations." },
  { value: "staff", label: "Staff", description: "Handles day-to-day operational tasks and customer service activities." },
  { value: "user", label: "User", description: "Accesses authorized features and services based on assigned permissions." },
];

const RoleForm = ({ role, saving, onCancel, onSave }: any) => {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [baseRole, setBaseRole] = useState(role?.baseRole ?? "staff");

  const isSystem = !!role?.isSystem;
  const selectedLevel = ACCESS_LEVELS.find((a) => a.value === baseRole);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      baseRole,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 px-5 py-5 sm:px-6">
        <Field label="Name" htmlFor="roleName">
          <input
            id="roleName"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            disabled={isSystem || saving}
          />
        </Field>
{/* lets new role has same access as admin or staff depending on access level chosen */}
        <Field label="Access level" htmlFor="roleBase">
          <select
            id="roleBase"
            className={inputClass}
            value={baseRole}
            onChange={(e) => setBaseRole(e.target.value)}
            disabled={isSystem || saving}
          >
            {ACCESS_LEVELS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          {selectedLevel && (
            <p className="mt-1.5 text-xs text-gray-500">{selectedLevel.description}</p>
          )}
        </Field>

        <Field label="Description" htmlFor="roleDesc">
          <textarea
            id="roleDesc"
            rows={3}
            className={`${inputClass} h-auto py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            disabled={saving}
          />
        </Field>
      </div>

      <ModalFooter>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving || name.trim().length < 2}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {role ? "Save changes" : "Create role"}
        </button>
      </ModalFooter>
    </form>
  );
};

export default RoleForm;