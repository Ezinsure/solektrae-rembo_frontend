"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from "../../components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import IremboLogo from "../../assets/logos/irembo-logo.png";
import { PhoneInput } from "international-fields";
import "international-fields/styles";

import {
    iremboSchema,
    type IremboFormValues,
    STEP_FIELDS,
} from "@/lib/form-schema";

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

const UserInfoForm = () => {
    const [step, setStep] = useState<Step>(1);
    const {
        register,
        handleSubmit,
        control,
        trigger,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<IremboFormValues>({
        resolver: zodResolver(iremboSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            service: "passport",
            height: "",
            villageHeadName: "",
            villageHeadPhone: "",
            district: "",
            sector: "",
            cell: "",
            village: "",
        },
    });

    // Live values for the review step
    const values = watch();
    const serviceLabel =
        SERVICES.find((s) => s.value === values.service)?.label ?? "—";

    const goNext = async () => {
        const fields = step === 1 ? STEP_FIELDS[1] : STEP_FIELDS[2];
        const ok = await trigger(fields as any, { shouldFocus: true });
        if (ok) setStep((s) => (s + 1) as Step);
    };

    const goBack = () => setStep((s) => (s - 1) as Step);

    const onSubmit = async (data: IremboFormValues) => {
        console.log("Submitting:", data);
        // TODO: send to your API
        alert("Form submitted successfully!");
    };

    const handleCancel = () => {
        if (confirm("Cancel and reset the form?")) {
            reset();
            setStep(1);
        }
    };

    return (
        <main className="md:py-10">
            {/* Step indicators */}
            <div className="flex items-center justify-between text-sm max-w-2xl container mx-auto my-6 mb-10">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                        <span
                            className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                                step === n
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {n}
                        </span>
                        <span
                            className={cn(
                                step === n ? "font-medium" : "text-muted-foreground"
                            )}
                        >
                            {n === 1 ? "Personal" : n === 2 ? "Location" : "Submit"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white max-w-2xl container mx-auto rounded-sm p-8 px-10">
                <header className="bg-[#E9E9EB] p-4 max-w-58 rounded-sm mx-auto my-3 mb-10">
                    <Image src={IremboLogo} alt="iremboLogo" />
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <FieldSet>
                            <FieldLegend className="text-xl!">
                                Irembo Services Application Form
                            </FieldLegend>
                            <FieldDescription className="text-xs mt-2">
                                Please complete the form below.
                            </FieldDescription>

                            <FieldGroup className="mt-4">
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
                                        Email *
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
                                        Phone Number *
                                    </FieldLabel>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <PhoneInput
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                                defaultCountry="RW"
                                                placeholder="Enter phone number"
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
                                    <Controller
                                        name="service"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
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
                                        )}
                                    />
                                    {errors.service && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.service.message}
                                        </p>
                                    )}
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end mt-6">
                                <Button type="button" onClick={goNext}>
                                    Next
                                </Button>
                            </div>
                        </FieldSet>
                    )}


                    {step === 2 && (
                        <FieldSet>
                            <FieldLegend className="text-xl!">Location & Details</FieldLegend>
                            <FieldDescription className="text-xs mt-2">
                                Please fill in the required information
                            </FieldDescription>

                            <FieldGroup className="mt-6">
                                <Field>
                                    <FieldLabel htmlFor="height" className="text-sm opacity-80">
                                        Height / Taille / Uburebure (Cm) *
                                    </FieldLabel>
                                    <Input id="height" type="number" {...register("height")} />
                                    {errors.height && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.height.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel
                                        htmlFor="villageHeadName"
                                        className="text-sm opacity-80"
                                    >
                                        Name of the Head of Village / Nom du chef du village /
                                        Amazina y'umukuru w'umudugudu *
                                    </FieldLabel>
                                    <Input
                                        id="villageHeadName"
                                        {...register("villageHeadName")}
                                    />
                                    {errors.villageHeadName && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.villageHeadName.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel
                                        htmlFor="villageHeadPhone"
                                        className="text-sm opacity-80"
                                    >
                                        Phone Number of the Head of Village / Numéro de téléphone du
                                        chef du village / Telefone y'umukuru w'umudugudu *
                                    </FieldLabel>
                                    <Input
                                        id="villageHeadPhone"
                                        type="tel"
                                        {...register("villageHeadPhone")}
                                    />
                                    {errors.villageHeadPhone && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.villageHeadPhone.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="district" className="text-sm opacity-80">
                                        District / Akarere *
                                    </FieldLabel>
                                    <Input id="district" {...register("district")} />
                                    {errors.district && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.district.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="sector" className="text-sm opacity-80">
                                        Sector / Umurenge *
                                    </FieldLabel>
                                    <Input id="sector" {...register("sector")} />
                                    {errors.sector && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.sector.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="cell" className="text-sm opacity-80">
                                        Cell / Akagari *
                                    </FieldLabel>
                                    <Input id="cell" {...register("cell")} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="village" className="text-sm opacity-80">
                                        Village / Umudugudu *
                                    </FieldLabel>
                                    <Input id="village" {...register("village")} />
                                    {errors.village && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.village.message}
                                        </p>
                                    )}
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-between mt-6">
                                <Button type="button" variant="outline" onClick={goBack}>
                                    Back
                                </Button>
                                <Button type="button" onClick={goNext}>
                                    Next
                                </Button>
                            </div>
                        </FieldSet>
                    )}


                    {step === 3 && (
                        <FieldSet>
                            <FieldLegend className="text-xl!">Review & Submit</FieldLegend>
                            <FieldDescription className="text-xs mt-2">
                                Please confirm your details before submitting
                            </FieldDescription>

                            {/* Inline ReviewSummary — reads live values from `watch()` */}
                            <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm space-y-4">
                                <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {values.name || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {values.email || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {values.phone || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Service:</span> {serviceLabel}
                                </p>
                                <p>
                                    <span className="font-medium">Height:</span>{" "}
                                    {values.height ? `${values.height} cm` : "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Head of Village:</span>{" "}
                                    {values.villageHeadName || "—"} (
                                    {values.villageHeadPhone || "—"})
                                </p>
                                <p>
                                    <span className="font-medium">District:</span>{" "}
                                    {values.district || "—"} /{" "}
                                    <span className="font-medium">Sector:</span>{" "}
                                    {values.sector || "—"}
                                </p>
                                <p>
                                    <span className="font-medium">Cell:</span>{" "}
                                    {values.cell || "—"} /{" "}
                                    <span className="font-medium">Village:</span>{" "}
                                    {values.village || "—"}
                                </p>
                            </div>

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
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        </FieldSet>
                    )}
                </form>
            </div>
        </main>
    );
};
export default UserInfoForm;
