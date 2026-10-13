"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    useCreateCustomer,
    usePublicServices,
    useUpdateCustomer,
} from "@/hooks/useCustomer";
import IremboLogo from "../../assets/logos/irembo-blue.png";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Skeleton } from "../ui/skeleton";

type Step = 1 | 2 | 3;

const PHONE_INPUT_STYLE = {
    width: "100%",
    height: "33px",
    background: "white",
    color: "#111",
    border: "1px solid #d1d5db",
    borderRadius: "0 0.5rem 0.5rem 0",
};
const PHONE_BUTTON_STYLE = {
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem 0 0 0.5rem",
};

const isEmptyPhone = (v?: string) => !v || v.replace(/\D/g, "").length <= 3;

const fieldLabel = (f: any) =>
    `${f.label.en} / ${f.label.fr} / ${f.label.rw}${f.required ? " *" : ""}`;

// Validation for one service field (required / optional, phone, number)
const fieldRule = (f: any) =>
    z
        .string()
        .optional()
        .transform((v) => (v ?? "").trim())
        .superRefine((v, ctx) => {
            const empty = f.type === "phone" ? isEmptyPhone(v) : !v;
            if (empty) {
                if (f.required)
                    ctx.addIssue({ code: "custom", message: "This field is required" });
                return;
            }
            if (f.type === "phone" && !/^\+\d{8,15}$/.test(v)) {
                ctx.addIssue({ code: "custom", message: "Enter a valid phone number" });
            }
            if (f.type === "number" && (isNaN(Number(v)) || Number(v) <= 0)) {
                ctx.addIssue({ code: "custom", message: "Enter a valid number" });
            }
        });

// Schema changes with the chosen service
const buildSchema = (service: any) => {
    const shape: any = {
        name: z.string().trim().min(2, "Enter your full names"),
        email: z.string().trim().email("Enter a valid email address"),
        phone: z.string().regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
        serviceId: z.string().min(1, "Choose a service"),
    };
    if (service?.allowCustomName) {
        shape.customServiceName = z.string().trim().min(2, "Type the service name");
    }
    for (const f of service?.fields ?? []) shape[f.key] = fieldRule(f);
    return z.object(shape).passthrough();
};

export function CustomerForm({
    customer,
    companySlug = process.env.NEXT_PUBLIC_COMPANY_SLUG?.trim() || "irembo-solektra",
    onSuccess,
}: {
    customer?: any;
    companySlug?: string;
    onSuccess?: () => void;
}) {
    const isEdit = !!customer;
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const {
        data: publicData,
        isLoading: servicesLoading,
        isError: servicesError,
    } = usePublicServices(companySlug);
    const services: any[] = publicData?.services ?? [];

    const pathname = usePathname();
    const isPending = createCustomer.isPending || updateCustomer.isPending;
    const [step, setStep] = useState<Step>(1);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Resolver reads the latest schema (it changes when the service changes)
    const schemaRef = useRef<any>(buildSchema(null));

    const defaultValues: any = {
        name: customer?.names ?? "",
        email: customer?.email ?? "",
        phone: customer?.phoneNumber ?? "",
        serviceId: customer?.serviceId ?? "",
        customServiceName: customer?.serviceRef ? "" : (customer?.service ?? ""),
        fatherName: customer?.fatherName ?? "",
        motherName: customer?.motherName ?? "",
        spouseName: customer?.spouseName ?? "",
        street: customer?.street ?? "",
        district: customer?.district ?? "",
        sector: customer?.sector ?? "",
        cell: customer?.cell ?? "",
        village: customer?.village ?? "",
        height: customer?.height ?? "",
        hovName: customer?.hovName ?? "",
        hovNumber: customer?.hovNumber ?? "",
    };

    const {
        register,
        handleSubmit,
        control,
        trigger,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<any>({
        resolver: (values, ctx, opts) =>
            zodResolver(schemaRef.current)(values, ctx, opts),
        mode: "onTouched",
        defaultValues,
    });

    const values = watch();
    const selectedService = services.find((s) => s.id === values.serviceId);
    const serviceFields: any[] = selectedService?.fields ?? [];
    const hasDetailsStep = serviceFields.length > 0;

    schemaRef.current = useMemo(
        () => buildSchema(selectedService),
        [selectedService],
    );

    // An edited customer may have a custom name from a catch-all service
    if (
        isEdit &&
        selectedService?.allowCustomName &&
        !values.customServiceName &&
        customer?.service
    ) {
        setValue("customServiceName", customer.service);
    }

    const serviceLabel = selectedService
        ? selectedService.allowCustomName
            ? values.customServiceName || selectedService.name
            : selectedService.name
        : "—";

    const handleOptionChange = (id: string) => {
        setValue("serviceId", id, { shouldValidate: true });
        setValue("customServiceName", "");
    };

    const goNext = async () => {
        const fields =
            step === 1
                ? ["name", "email", "phone", "serviceId"]
                : serviceFields.map((f) => f.key);

        const ok = await trigger(fields as any, { shouldFocus: true });
        if (!ok) return;

        if (step === 1) setStep(hasDetailsStep ? 2 : 3);
        else setStep(3);
    };

    const goBack = () => {
        if (step === 3) setStep(hasDetailsStep ? 2 : 1);
        else setStep(1);
    };

    const resetForm = () => {
        reset(defaultValues);
        setStep(1);
    };

    const onSubmit = (data: any) => {
        setSubmitError(null);
        setSubmitSuccess(false);
        if (!selectedService) return setSubmitError("Please choose a service.");

        const payload: any = {
            names: data.name,
            email: data.email,
            phoneNumber: data.phone,
            serviceId: data.serviceId,
        };
        if (selectedService.allowCustomName)
            payload.customServiceName = data.customServiceName;
        for (const f of serviceFields) {
            const v = data[f.key] ?? "";
            payload[f.key] = f.type === "phone" && isEmptyPhone(v) ? "" : v;
        }

        const handlers = {
            onSuccess: () => {
                setSubmitSuccess(true);
                setTimeout(() => {
                    if (!isEdit) resetForm();
                    setSubmitSuccess(false);
                    onSuccess?.();
                }, 1200);
            },
            onError: (error: any) => {
                setSubmitError(
                    error?.response?.data?.message ??
                    "Something went wrong. Please try again.",
                );
            },
        };

        if (isEdit)
            updateCustomer.mutate({ id: customer.id, data: payload }, handlers);
        else createCustomer.mutate({ slug: companySlug, data: payload }, handlers);
    };

    const handleCancel = () => {
        if (confirm("Cancel and reset the form?")) {
            resetForm();
            onSuccess?.();
        }
    };
    console.log("company slug:", companySlug);

    return (
        <main className="md:pb-10">
            <div className="flex items-center justify-between text-sm max-w-2xl container mx-auto my-6">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                        <span
                            className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                                step === n
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                            )}
                        >
                            {n}
                        </span>
                        <span
                            className={cn(
                                step === n ? "font-medium" : "text-muted-foreground",
                            )}
                        >
                            {n === 1 ? "Personal" : n === 2 ? "Details" : "Submit"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white max-w-2xl container mx-auto rounded-sm px-10 pb-8">
                {pathname === "/" && (
                    <header className="max-w-60 rounded-sm mx-auto mb-2">
                        <Image src={IremboLogo} alt="iremboLogo" />
                    </header>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <FieldSet>
                            <FieldLegend className="text-xl!">
                                {isEdit ? "Edit Customer" : "Irembo Services Application Form"}
                            </FieldLegend>
                            <FieldDescription className="text-xs mt-2">
                                {isEdit
                                    ? "Update the customer's details."
                                    : "Please complete the form below."}
                            </FieldDescription>

                            <FieldGroup className="mt-3">
                                <Field>
                                    <FieldLabel htmlFor="name" className="text-sm opacity-80">
                                        Name / Nom / Amazina *
                                    </FieldLabel>
                                    <Input id="name" {...register("name")} />
                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {String(errors.name.message)}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email" className="text-sm opacity-80">
                                        Email / Imeli *
                                    </FieldLabel>
                                    <Input id="email" type="email" {...register("email")} />
                                    {errors.email && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {String(errors.email.message)}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="phone" className="text-sm opacity-80">
                                        Phone Number / Numéro de téléphone / Nomero ya Telefoni *
                                    </FieldLabel>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <PhoneInput
                                                country="rw"
                                                value={field.value}
                                                onChange={(value) => field.onChange("+" + value)}
                                                inputStyle={PHONE_INPUT_STYLE}
                                                buttonStyle={PHONE_BUTTON_STYLE}
                                            />
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {String(errors.phone.message)}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel className="text-sm opacity-80 mb-1">
                                        Choose Service / Choisir un service / Hitamo Serivisi *
                                    </FieldLabel>

                                    {servicesLoading ? (
                                        <div className="space-y-2">
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="flex h-[39px] items-center justify-between max-w-1/2 rounded-xl border border-border px-2.5"
                                                >
                                                    <Skeleton className="h-4 w-24 rounded-md" />
                                                    <Skeleton className="h-4 w-4 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : servicesError ? (
                                        <p className="text-sm text-red-600">
                                            Could not load services. Please refresh the page.
                                        </p>
                                    ) : services.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No services are available at the moment.
                                        </p>
                                    ) : (
                                        <RadioGroup
                                            value={values.serviceId}
                                            onValueChange={handleOptionChange}
                                            className="max-w-1/2"
                                        >
                                            {services.map((s) => (
                                                <FieldLabel key={s.id} htmlFor={s.id}>
                                                    <Field orientation="horizontal">
                                                        <FieldContent>
                                                            <FieldTitle>{s.name}</FieldTitle>
                                                        </FieldContent>
                                                        <RadioGroupItem value={s.id} id={s.id} />
                                                    </Field>
                                                </FieldLabel>
                                            ))}
                                        </RadioGroup>
                                    )}
                                    {errors.serviceId && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {String(errors.serviceId.message)}
                                        </p>
                                    )}
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end mt-6">
                                <Button
                                    type="button"
                                    onClick={goNext}
                                    disabled={servicesLoading || services.length === 0}
                                >
                                    Next <ArrowRight />
                                </Button>
                            </div>
                        </FieldSet>
                    )}

                    {step === 2 && (
                        <FieldSet>
                            <FieldGroup>
                                {serviceFields.map((f) => (
                                    <Field key={f.key}>
                                        <FieldLabel htmlFor={f.key} className="text-sm opacity-80">
                                            {fieldLabel(f)}
                                        </FieldLabel>

                                        {f.type === "phone" ? (
                                            <Controller
                                                name={f.key}
                                                control={control}
                                                render={({ field }) => (
                                                    <PhoneInput
                                                        country="rw"
                                                        value={field.value}
                                                        onChange={(value) => field.onChange("+" + value)}
                                                        inputStyle={PHONE_INPUT_STYLE}
                                                        buttonStyle={PHONE_BUTTON_STYLE}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <Input
                                                id={f.key}
                                                type={f.type === "number" ? "number" : "text"}
                                                {...register(f.key)}
                                            />
                                        )}

                                        {errors[f.key] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {String(errors[f.key]?.message)}
                                            </p>
                                        )}
                                    </Field>
                                ))}
                                {selectedService?.allowCustomName && (
                                    <Field>
                                        <FieldLabel
                                            htmlFor="customServiceName"
                                            className="text-sm opacity-80"
                                        >
                                            Service name / Nom du service / Izina rya serivisi *
                                        </FieldLabel>
                                        <Input
                                            id="customServiceName"
                                            {...register("customServiceName")}
                                        />
                                        {errors.customServiceName && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {String(errors.customServiceName.message)}
                                            </p>
                                        )}
                                    </Field>
                                )}
                            </FieldGroup>

                            <div className="flex justify-between mt-6">
                                <Button type="button" variant="outline" onClick={goBack}>
                                    <ArrowLeft /> Back
                                </Button>
                                <Button type="button" onClick={goNext}>
                                    Next <ArrowRight />
                                </Button>
                            </div>
                        </FieldSet>
                    )}

                    {step === 3 && (
                        <FieldSet>
                            <FieldLegend className="text-xl!">Review & Submit</FieldLegend>
                            <FieldDescription className="text-xs mt-2">
                                Please confirm the details before submitting
                            </FieldDescription>

                            <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm space-y-4">
                                <p>
                                    <span className="font-medium">Name / Amazina:</span>{" "}
                                    {values.name || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Email / Imeli:</span>{" "}
                                    {values.email || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Phone Number:</span>{" "}
                                    {values.phone || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Service / Serivisi:</span>{" "}
                                    {serviceLabel}
                                </p>

                                {serviceFields.map((f) => {
                                    const v = values[f.key];
                                    const empty = f.type === "phone" ? isEmptyPhone(v) : !v;
                                    return (
                                        <p key={f.key}>
                                            <span className="font-medium">{f.label.en}:</span>{" "}
                                            {empty ? "—" : f.key === "height" ? `${v} cm` : v}
                                        </p>
                                    );
                                })}
                            </div>

                            {submitError && (
                                <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                    {submitError}
                                </div>
                            )}
                            {submitSuccess && (
                                <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                                    {isEdit
                                        ? "Customer updated successfully."
                                        : "Your application was submitted successfully."}
                                </div>
                            )}

                            <div className="flex justify-between mt-6">
                                <Button type="button" variant="outline" onClick={goBack}>
                                    Back
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending
                                            ? "Saving..."
                                            : isEdit
                                                ? "Save changes"
                                                : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        </FieldSet>
                    )}
                </form>
            </div>
        </main>
    );
}
