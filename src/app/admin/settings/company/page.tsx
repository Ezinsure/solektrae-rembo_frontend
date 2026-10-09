"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { PageHeader, Section, inputClass } from "@/components/settings/ui";
import { sampleCompany, type Company } from "@/lib/settings/datas";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CompanyProfilePage = () => {
    const [saved, setSaved] = useState<Company>(sampleCompany); // TODO: load from API
    const [form, setForm] = useState<Company>(sampleCompany);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
    const set = <K extends keyof Company>(k: K, v: Company[K]) => setForm((f) => ({ ...f, [k]: v }));

    const pickLogo = (file?: File) => {
        setError(null);
        if (!file) return;
        if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
        if (file.size > 2 * 1024 * 1024) return setError("The logo must be smaller than 2 MB.");
        set("logo", URL.createObjectURL(file)); // TODO: upload to storage
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); setSaved(form); /* TODO: API */ }}>
            <PageHeader title="Company profile" description="Shown on receipts, emails and across the system." />
            <div className="lg:px-20 px-2">
                <Section title="Logo" description="Square PNG or JPG, up to 2 MB.">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                            {form.logo
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={form.logo} alt="Company logo" className="h-full w-full object-cover" />
                                : <ImagePlus className="h-7 w-7 text-gray-400" />}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickLogo(e.target.files?.[0])} />
                        <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
                            {form.logo ? "Change logo" : "Upload logo"}
                        </button>
                        {form.logo && (
                            <button type="button" className="btn-ghost text-red-600" onClick={() => set("logo", null)}>
                                <Trash2 className="h-4 w-4" /> Remove
                            </button>
                        )}
                    </div>
                    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                </Section>

                <Section title="Details" description="Your company's name and contacts.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                            <FieldLabel htmlFor="Company name" className="text-sm opacity-80"></FieldLabel>
                            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="Phone Number" className="text-sm opacity-80"></FieldLabel>
                            <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                        </Field>
                        <Field >
                            <FieldLabel htmlFor="Email" className="text-sm opacity-80"></FieldLabel>
                            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                        </Field>
                    </div>
                </Section>

                <Section title="About" description="A short description of what you do.">
                    <Field>
                        <FieldLabel htmlFor="About Company" className="text-sm opacity-80"></FieldLabel>
                        <textarea id="about" rows={5} maxLength={500} className={`${inputClass} h-auto py-2`} value={form.about} onChange={(e) => set("about", e.target.value)} />
                    </Field>
                </Section>

                <div className="flex justify-end gap-2 pt-5">
                    <Button type="button" className="btn-secondary" disabled={!dirty} onClick={() => setForm(saved)}>Discard</Button>
                    <Button type="submit" className="btn-primary" disabled={!dirty}>Save changes</Button>
                </div></div>
        </form>
    );
}
export default CompanyProfilePage