"use client";

import { useState } from "react";
import { Lock, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { EmptyState, PageHeader, Pill, } from "@/components/settings/ui";
import { sampleRoles, type Role } from "@/lib/settings/datas";
import Modal, { ConfirmModal } from "@/components/modal/settingModal";
import RoleForm from "@/components/forms/roleForm";

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>(sampleRoles); // TODO: load from API
  const [editing, setEditing] = useState<Role | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const save = (data: Pick<Role, "name" | "description">) => {
    if (editing) setRoles((l) => l.map((r) => (r.id === editing.id ? { ...r, ...data } : r)));
    else setRoles((l) => [...l, { ...data, id: crypto.randomUUID(), users: 0 }]);
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Roles decide what each user can see and do."
        action={<button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> New role</button>}
      />

      {roles.length === 0 ? (
        <div className="mt-6"><EmptyState title="No roles yet" /></div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <li key={role.id} className="flex flex-col rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                {role.system && <Pill><Lock className="mr-1 h-3 w-3" /> System</Pill>}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{role.name}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-500">{role.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="h-4 w-4" /> {role.users} {role.users === 1 ? "user" : "users"}
                </span>
                <div className="flex gap-1">
                  <button className="icon-btn" aria-label={`Edit ${role.name}`} onClick={() => { setEditing(role); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="icon-btn hover:text-red-600"
                    aria-label={`Delete ${role.name}`}
                    disabled={role.system || role.users > 0}
                    title={role.system ? "System roles can't be deleted" : role.users > 0 ? "Move its users to another role first" : undefined}
                    onClick={() => setDeleting(role)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit role" : "New role"} description="Permissions can be added once the API is ready.">
        {formOpen && <RoleForm key={editing?.id ?? "new"} role={editing} onCancel={() => setFormOpen(false)} onSave={save} />}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete role?"
        message={<>The <strong>{deleting?.name}</strong> role will be removed.</>}
        onConfirm={() => setRoles((l) => l.filter((r) => r.id !== deleting?.id))}
      />
    </div>
  );
}
export default RolesPage

