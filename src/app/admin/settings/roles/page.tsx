"use client";

import { useState } from "react";
import { Loader2, Lock, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { EmptyState, PageHeader, Pill } from "@/components/settings/ui";
import Modal, { ConfirmModal } from "@/components/modal/settingModal";
import RoleForm from "@/components/forms/roleForm";
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "@/hooks/useRoles";

const RolesPage = () => {
  const { data: allRoles = [], isLoading, isError } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [editing, setEditing] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);

  // Developer is a system-wide role, so company admins don't see it
  const roles = allRoles.filter((r: any) => r.baseRole !== "dev");
  const saving = createRole.isPending || updateRole.isPending;

  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };

  const save = (data: any) => {
    const done = { onSuccess: () => setFormOpen(false) };

    if (editing) {
      // Built-in roles can only change their description
      const payload = editing.isSystem ? { description: data.description } : data;
      updateRole.mutate({ id: editing.id, data: payload }, done);
    } else {
      createRole.mutate(data, done);
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteRole.mutate(deleting.id, { onSettled: () => setDeleting(null) });
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Roles decide what each user can see and do."
        action={<button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> New role</button>}
      />

      {isLoading ? (
        <div className="mt-6 flex h-40 items-center justify-center text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="mt-6 text-sm text-red-600">Could not load roles. Please refresh the page.</p>
      ) : roles.length === 0 ? (
        <div className="mt-6"><EmptyState title="No roles yet" /></div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role: any) => (
            <li key={role.id} className="flex flex-col rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                {role.isSystem && <Pill><Lock className="mr-1 h-3 w-3" /> System</Pill>}
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
                    disabled={role.isSystem || role.users > 0}
                    title={role.isSystem ? "System roles can't be deleted" : role.users > 0 ? "Move its users to another role first" : undefined}
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

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit role" : "New role"}
        description={editing?.isSystem ? "Built-in role: only the description can be changed." : "The access level decides what this role can open."}
      >
        {formOpen && (
          <RoleForm key={editing?.id ?? "new"} role={editing} saving={saving} onCancel={closeForm} onSave={save} />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => !deleteRole.isPending && setDeleting(null)}
        title="Delete role?"
        message={<>The <strong>{deleting?.name}</strong> role will be removed.</>}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RolesPage;