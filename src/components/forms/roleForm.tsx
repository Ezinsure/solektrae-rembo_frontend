'use client';

import { useState } from "react";
import { Field, inputClass } from "../settings/ui";
import { Role } from "@/lib/settings/datas";
import { ModalFooter } from "../modal/settingModal";




const RoleForm=({ role, onCancel, onSave }: { role: Role | null; onCancel: () => void; onSave: (d: Pick<Role, "name" | "description">) => void })=> {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ name: name.trim(), description: description.trim() }); }}>
      <div className="grid gap-4 px-5 py-5 sm:px-6">
        <Field label="Name" htmlFor="roleName">
          <input id="roleName" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
        </Field>
        <Field label="Description" htmlFor="roleDesc">
          <textarea id="roleDesc" rows={3} className={`${inputClass} h-auto py-2`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
        </Field>
      </div>
      <ModalFooter>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{role ? "Save changes" : "Create role"}</button>
      </ModalFooter>
    </form>
  );
}
export default RoleForm