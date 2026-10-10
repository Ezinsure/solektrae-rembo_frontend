"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, Trash2, Upload } from "lucide-react";
import { PageHeader, Section, inputClass } from "@/components/settings/ui";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentCompany, useMyCompanies, useUpdateCompany } from "@/hooks/useCompany";
import { useGetMe } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useUploadCompanyLogo, useRemoveCompanyLogo } from "@/hooks/useCompany";

const FIELDS = ["name", "email", "phoneNumber", "about"];

const toForm = (c: any) => ({
    name: c?.name ?? "",
    email: c?.email ?? "",
    phoneNumber: c?.phoneNumber ?? "",
    about: c?.about ?? "",
});

const MAX_LOGO_MB = 2;
const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CompanyProfilePage = () => {
    const { data: company, isLoading, isError } = useCurrentCompany();
    const { data: companies = [] } = useMyCompanies();
    const updateCompany = useUpdateCompany();
    const { data: user } = useGetMe();
    const hasAccess = ["dev", "admin"].includes(user?.role ?? "");
    const [form, setForm] = useState<any>(toForm(null));
    const uploadLogo = useUploadCompanyLogo();
    const removeLogo = useRemoveCompanyLogo();
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const logoBusy = uploadLogo.isPending || removeLogo.isPending;
    const logoSrc = preview ?? company?.logoUrl ?? null;

    // free the preview URL when it's replaced or the page closes
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const handlePickLogo = (e: any) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!LOGO_TYPES.includes(file.type)) return toast.error("Only JPG, PNG or WEBP images are allowed");
        if (file.size > MAX_LOGO_MB * 1024 * 1024) return toast.error(`Image must be ${MAX_LOGO_MB} MB or smaller`);

        setPreview(URL.createObjectURL(file));
        uploadLogo.mutate(file, { onSettled: () => setPreview(null) });
    };

    const handleRemoveLogo = () => removeLogo.mutate();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (company) setForm(toForm(company));
    }, [company]);

    const original: any = toForm(company);
    const dirty = FIELDS.some((k) => form[k] !== original[k]);

    // Only admins can PATCH /companies/current
    const role = companies.find((c: any) => c.isCurrent)?.role;
    const canEdit = role === "admin"; // TODO: match your UserRole value

    const set = (key: string) => (e: any) =>
        setForm((f: any) => ({ ...f, [key]: e.target.value }));

    const handleSave = (e: any) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        // Send only the fields that changed. An empty optional field is sent as null.
        const payload: any = {};
        for (const k of FIELDS) {
            if (form[k] !== original[k]) {
                const v = form[k].trim();
                payload[k] = v === "" && k !== "name" ? null : v;
            }
        }
        updateCompany.mutate(payload);
    };

    const handleDiscard = () => setForm(toForm(company));

    if (isLoading) {
        return (
            <div className="flex h-60 items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        );
    }

    if (isError || !company) {
        return (
            <p className="p-6 text-sm text-destructive">
                Could not load the company profile. Please refresh the page.
            </p>
        );
    }

    return (
        <form onSubmit={handleSave} className="px-2 lg:px-20">
            <PageHeader
                title="Company profile"
                description="This information appears on receipts, emails and customer pages."
            />

            <Section title="Logo">
                <div className="flex items-center gap-4">
                    <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                        {logoSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoSrc} alt="Company logo" className="size-full object-cover" />
                        ) : (
                            <Building2 className="size-6 text-muted-foreground" />
                        )}

                        {logoBusy && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                <Loader2 className="size-5 animate-spin text-gray-600" />
                            </div>
                        )}
                    </div>

                    {canEdit && (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePickLogo}
                                />
                                <Button type="button" variant="outline" size="sm" disabled={logoBusy} onClick={() => fileRef.current?.click()}>
                                    <Upload className="mr-2 size-4" />
                                    {company?.logoUrl ? "Change logo" : "Upload logo"}
                                </Button>

                                {company?.logoUrl && (
                                    <Button type="button" variant="ghost" size="sm" disabled={logoBusy} onClick={handleRemoveLogo} className="text-red-600 hover:text-red-700">
                                        <Trash2 className="mr-2 size-4" /> Remove
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">JPG, PNG or WEBP, up to {MAX_LOGO_MB} MB.</p>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Details">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="name">Company name</FieldLabel>
                        <Input id="name" value={form.name} onChange={set("name")} required disabled={!canEdit} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                        <Input id="phoneNumber" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+250 7xx xxx xxx" disabled={!canEdit} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" type="email" value={form.email} onChange={set("email")} disabled={!canEdit} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="about">About</FieldLabel>
                        <textarea
                            id="about"
                            rows={5}
                            value={form.about}
                            onChange={set("about")}
                            className={inputClass}
                            disabled={!canEdit}
                        />
                    </Field>
                </div>
            </Section>

            {canEdit && (
                hasAccess && (<div className="flex justify-end gap-2 py-6">
                    <Button type="button" variant="outline" onClick={handleDiscard} disabled={!dirty || updateCompany.isPending}>
                        Discard
                    </Button>
                    <Button type="submit" disabled={!dirty || updateCompany.isPending}>
                        {updateCompany.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Save changes
                    </Button>
                </div>)
            )}
        </form>
    );
}
export default CompanyProfilePage