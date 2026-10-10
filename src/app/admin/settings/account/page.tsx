"use client";

import { useState } from "react";
import { Building2, Check, Loader2, Plus, Repeat } from "lucide-react";
import Modal, { ModalFooter } from "@/components/modal/settingModal";
import { Field, PageHeader, Pill, Section, inputClass } from "@/components/settings/ui";
import { useCreateCompany, useMyCompanies, useSwitchCompany } from "@/hooks/useCompany";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/hooks/useAuth";

const membersLabel = (n: number) => `${n} member${n === 1 ? "" : "s"}`;

const AccountLogo = ({ account, large }: any) => {
  const size = large ? "h-12 w-12" : "h-9 w-9";
  return account?.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={account.logoUrl} alt="" className={cn(size, "rounded-lg object-cover")} />
  ) : (
    <span className={cn(size, "flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500")}>
      <Building2 className={large ? "h-6 w-6" : "h-4 w-4"} />
    </span>
  );
};

const SystemAccountPage = () => {
  const { data: accounts = [], isLoading, isError } = useMyCompanies();
  const switchCompany = useSwitchCompany();
  const createCompany = useCreateCompany();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: user } = useGetMe();
  const isDev = user?.role === "dev";

  const current: any = accounts.find((a: any) => a.isCurrent);

  const switchTo = (id: string) => {
    if (switchCompany.isPending) return;
    switchCompany.mutate(id);
  };

  const handleCreate = (e: any) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("accName") ?? "").trim();
    if (!name) return;
    createCompany.mutate({ name }, { onSuccess: () => setCreateOpen(false) });
  };

  const closeCreate = () => {
    if (!createCompany.isPending) setCreateOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="System account"
        description="System Account."
        action={
          user && ["admin", "dev"].includes(user.role) && <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New account
          </button>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-red-600">Could not load your accounts. Please refresh the page.</p>
      ) : (
        <>
          {current && (
            <Section title="Current account" description="Everything you see in the system belongs to this account.">
              <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <AccountLogo account={current} large />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{current.name}</p>
                  <p className="text-sm text-gray-500">
                    You are <strong className="font-medium capitalize text-gray-700">{current.role}</strong> · {membersLabel(current.members)}
                  </p>
                </div>
                <Pill tone="green">Active</Pill>
              </div>
            </Section>
          )}

          <Section title="Your accounts" description="Accounts you have been invited to.">
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-500">You don&apos;t belong to any account yet.</p>
            ) : (
              <ul className="space-y-2">
                {accounts.map((a: any) => {
                  const active = a.isCurrent;
                  const switching = switchCompany.isPending && switchCompany.variables === a.id;
                  return (
                    <li
                      key={a.id}
                      className={cn("flex items-center gap-3 rounded-xl border p-3", active ? "border-primary/30" : "border-gray-200")}
                    >
                      <AccountLogo account={a} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="capitalize">{a.role}</span> · {membersLabel(a.members)}
                        </p>
                      </div>
                      {active ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Check className="h-4 w-4" /> Current
                        </span>
                      ) : (
                        isDev && <button className="btn-secondary" disabled={switchCompany.isPending} onClick={() => switchTo(a.id)}>
                          {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
                          {switching ? "Switching…" : "Switch"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </>
      )}

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="New account"
        description="Create a separate workspace for another company. You'll be its admin."
      >
        <form onSubmit={handleCreate}>
          <div className="grid gap-4 px-5 py-5 sm:px-6">
            <Field label="Company name" htmlFor="accName">
              <input id="accName" name="accName" className={inputClass} required maxLength={80} disabled={createCompany.isPending} />
            </Field>
            <p className="text-xs text-gray-500">You can add the logo, roles and services after creating it.</p>
          </div>
          <ModalFooter>
            <button type="button" className="btn-secondary" onClick={closeCreate} disabled={createCompany.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createCompany.isPending}>
              {createCompany.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createCompany.isPending ? "Creating…" : "Create account"}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
export default SystemAccountPage;