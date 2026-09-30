"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    iremboSchema,
    type IremboFormValues,
    getStep1Fields,
    getStep2Fields,
    STEP2_ALL_FIELDS,
    FIELD_META,
} from "@/lib/form-schema";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer";
import IremboLogo from "../../assets/logos/irembo-blue.png";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Step = 1 | 2 | 3;

const SERVICES = [
    { value: "passport", label: "Passport" },
    { value: "laisserpasser", label: "Laissez-Passer" },
    { value: "foreignid", label: "Foreigner ID" },
    { value: "visa", label: "Visa" },
    { value: "permit", label: "Permit" },
    { value: "cpgl", label: "CEPGL" },
    { value: "penalty", label: "Penalty" },
    { value: "others", label: "Other Services" },
];

export function CustomerForm({
    customer,
    onSuccess,
}: {
    customer?: any;
    onSuccess?: () => void;
}) {
    const isEdit = !!customer;
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const pathname = usePathname();
    const isPending = createCustomer.isPending || updateCustomer.isPending;
    const [step, setStep] = useState<Step>(1);
    const [selectedOption, setSelectedOption] = useState(() => {
        if (!customer) return "passport";
        const known = SERVICES.some((s) => s.value === customer.service);
        return known ? customer.service : "others";
    });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        trigger,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IremboFormValues>({
        resolver: zodResolver(iremboSchema),
        mode: "onTouched",
        defaultValues: {
            name: customer?.names ?? "",
            email: customer?.email ?? "",
            phone: customer?.phoneNumber ?? "",
            service: customer?.service ?? "passport",
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
        },
    });

    const values = watch();

    const serviceLabel =
        selectedOption === "others"
            ? values.service || "—"
            : (SERVICES.find((s) => s.value === values.service)?.label ?? "—");

    const handleOptionChange = (option: string) => {
        setSelectedOption(option);
        setValue("service", option !== "others" ? option : "", {
            shouldValidate: true,
        });
    };

    const goNext = async () => {
        const fields =
            step === 1
                ? getStep1Fields(selectedOption)
                : getStep2Fields(values.service);
        const ok = await trigger(fields as any, { shouldFocus: true });
        if (ok) setStep((s) => (s + 1) as Step);
    };

    const goBack = () => setStep((s) => (s - 1) as Step);

    const onSubmit = (data: IremboFormValues) => {
        setSubmitError(null);
        setSubmitSuccess(false);

        const { name, phone, ...rest } = data;
        const payload = {
            ...rest,
            names: name,
            phoneNumber: phone,
        };

        const mutation = isEdit
            ? updateCustomer.mutate(
                { id: customer.id, data: payload },
                {
                    onSuccess: () => {
                        setSubmitSuccess(true);
                        setTimeout(() => {
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
                },
            )
            : createCustomer.mutate(payload, {
                onSuccess: () => {
                    setSubmitSuccess(true);
                    setTimeout(() => {
                        reset();
                        setSelectedOption("passport");
                        setStep(1);
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
            });
    };

    const handleCancel = () => {
        if (confirm("Cancel and reset the form?")) {
            reset();
            setSelectedOption("passport");
            setStep(1);
            onSuccess?.();
        }
    };

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
                            {n === 1 ? "Personal" : n === 2 ? "Location" : "Submit"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white max-w-xl container mx-auto rounded-sm px-10">
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
                                            {errors.name.message}
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
                                            {errors.email.message}
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
                                                inputStyle={{
                                                    width: "100%",
                                                    height: "33px",
                                                    background: "white",
                                                    color: "#111",
                                                    border: "1px solid #d1d5db",
                                                    borderRadius: "0 0.5rem 0.5rem 0",
                                                }}
                                                buttonStyle={{
                                                    background: "white",
                                                    border: "1px solid #d1d5db",
                                                    borderRadius: "0.5rem 0 0 0.5rem",
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </Field>
                                <Field>
                                    <FieldLabel className="text-sm opacity-80">
                                        Choose Service / Choisir un service / Hitamo Serivisi *
                                    </FieldLabel>

                                    <RadioGroup
                                        value={selectedOption}
                                        onValueChange={handleOptionChange}
                                        className="max-w-44"
                                    >
                                        {SERVICES.map((s) => (
                                            <FieldLabel key={s.value} htmlFor={s.value}>
                                                <Field orientation="horizontal">
                                                    <FieldContent>
                                                        <FieldTitle>{s.label}</FieldTitle>
                                                    </FieldContent>
                                                    <RadioGroupItem value={s.value} id={s.value} />
                                                </Field>
                                            </FieldLabel>
                                        ))}
                                    </RadioGroup>
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end mt-6">
                                <Button type="button" onClick={goNext}>
                                    Next <ArrowRight />
                                </Button>
                            </div>
                        </FieldSet>
                    )}

                    {step === 2 && (
                        <FieldSet>
                            <FieldGroup>
                                {STEP2_ALL_FIELDS.filter((key) =>
                                    getStep2Fields(values.service).includes(key),
                                ).map((key) => {
                                    const meta = FIELD_META[key];
                                    return (
                                        <Field key={key}>
                                            <FieldLabel htmlFor={key} className="text-sm opacity-80">
                                                {meta.label}
                                            </FieldLabel>
                                            <Input
                                                id={key}
                                                type={meta.type ?? "text"}
                                                {...register(key)}
                                            />
                                            {errors[key] && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors[key]?.message}
                                                </p>
                                            )}
                                        </Field>
                                    );
                                })}
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

                                {STEP2_ALL_FIELDS.filter(
                                    (key) =>
                                        key !== "service" &&
                                        getStep2Fields(values.service).includes(key),
                                ).map((key) => (
                                    <p key={key}>
                                        <span className="font-medium">
                                            {FIELD_META[key].label.split(" / ")[0].replace(" *", "")}:
                                        </span>{" "}
                                        {key === "height" && values[key]
                                            ? `${values[key]} cm`
                                            : values[key] || "—"}
                                    </p>
                                ))}
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
