"use client";

import { useState } from "react";
import { Building2, Check, Plus, Repeat } from "lucide-react";
import Modal, { ModalFooter } from "@/components/modal/settingModal";
import { Field, PageHeader, Pill, Section, inputClass } from "@/components/settings/ui";
import { sampleAccounts, type SystemAccount } from "@/lib/settings/datas";
import { cn } from "@/lib/utils";

const SystemAccountPage=()=> {
  const [accounts, setAccounts] = useState<SystemAccount[]>(sampleAccounts); // TODO: load from API
  const [currentId, setCurrentId] = useState(sampleAccounts[0].id);
  const [createOpen, setCreateOpen] = useState(false);
  const current = accounts.find((a) => a.id === currentId)!;

  const switchTo = (id: string) => {
    setCurrentId(id);
    // TODO: call the API to switch account, then reload data (new logo, roles, services...)
  };

  return (
    <div>
      <PageHeader
        title="System account"
        description="Each company has its own logo, users, roles and services. Switch between the accounts you belong to."
        action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New account</button>}
      />

      <Section title="Current account" description="Everything you see in the system belongs to this account.">
        <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <AccountLogo account={current} large />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">{current.name}</p>
            <p className="text-sm text-gray-500">You are <strong className="font-medium text-gray-700">{current.role}</strong> · {current.members} members</p>
          </div>
          <Pill tone="green">Active</Pill>
        </div>
      </Section>

      <Section title="Your accounts" description="Accounts you have been invited to.">
        <ul className="space-y-2">
          {accounts.map((a) => {
            const active = a.id === currentId;
            return (
              <li key={a.id} className={cn("flex items-center gap-3 rounded-xl border p-3", active ? "border-primary/30" : "border-gray-200")}>
                <AccountLogo account={a} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.role} · {a.members} members</p>
                </div>
                {active ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-primary"><Check className="h-4 w-4" /> Current</span>
                ) : (
                  <button className="btn-secondary" onClick={() => switchTo(a.id)}><Repeat className="h-4 w-4" /> Switch</button>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New account" description="Create a separate workspace for another company. You'll be its admin.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = String(new FormData(e.currentTarget).get("accName")).trim();
            const acc = { id: crypto.randomUUID(), name, logo: null, role: "Admin", members: 1 };
            setAccounts((l) => [...l, acc]); // TODO: API
            setCreateOpen(false);
          }}
        >
          <div className="grid gap-4 px-5 py-5 sm:px-6">
            <Field label="Company name" htmlFor="accName">
              <input id="accName" name="accName" className={inputClass} required maxLength={80} />
            </Field>
            <p className="text-xs text-gray-500">You can add the logo, roles and services after creating it.</p>
          </div>
          <ModalFooter>
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create account</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
export default SystemAccountPage

function AccountLogo({ account, large }: { account: SystemAccount; large?: boolean }) {
  const size = large ? "h-12 w-12" : "h-9 w-9";
  return account.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={account.logo} alt="" className={cn(size, "rounded-lg object-cover")} />
  ) : (
    <span className={cn(size, "flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500")}>
      <Building2 className={large ? "h-6 w-6" : "h-4 w-4"} />
    </span>
  );
}
