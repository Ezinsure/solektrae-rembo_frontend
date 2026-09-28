"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getUserSchema, type UserFormValues } from "@/lib/form-schema";
import { useCreateUser, useUpdateUser } from "@/hooks/useUser";
import { ROLE_OPTIONS } from "@/config/nav";

export function UserForm({
    user,
    onSuccess,
}: {
    user?: any;
    onSuccess?: () => void;
}) {
    const isEdit = !!user;
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const isPending = createUser.isPending || updateUser.isPending;

    const [showPassword, setShowPassword] = useState(false);
    const schema = useMemo(() => getUserSchema(isEdit), [isEdit]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            names: user?.names ?? "",
            email: user?.email ?? "",
            phoneNumber: user?.phoneNumber ?? "",
            role: user?.role ?? "",
            password: "",
        },
    });

    const onSubmit = (data: UserFormValues) => {
        // never send an empty password on update
        const { password, ...rest } = data;
        const payload = isEdit && !password ? rest : data;

        if (isEdit) {
            updateUser.mutate({ id: user.id, data: payload }, { onSuccess });
        } else {
            createUser.mutate(payload, { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="names" className="text-sm opacity-80">
                        Full names *
                    </FieldLabel>
                    <Input id="names" {...register("names")} />
                    {errors.names && (
                        <p className="text-xs text-red-500 mt-1">{errors.names.message}</p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="email" className="text-sm opacity-80">
                        Email *
                    </FieldLabel>
                    <Input id="email" type="email" autoComplete="off" {...register("email")} />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="password" className="text-sm opacity-80">
                        {isEdit ? "New password (leave blank to keep current)" : "Password *"}
                    </FieldLabel>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="pr-10"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="phoneNumber" className="text-sm opacity-80">
                        Phone number *
                    </FieldLabel>
                    <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                country="rw"
                                value={field.value}
                                onChange={(value) => field.onChange("+" + value)}
                                placeholder="Enter phone number"
                            />
                        )}
                    />
                    {errors.phoneNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
                    )}
                </Field>

                <Field>
                    <FieldLabel className="text-sm opacity-80">Role *</FieldLabel>
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "")}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.role && (
                        <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
                    )}
                </Field>
            </FieldGroup>

            <Button type="submit" className="w-1/2 flex mx-auto mt-6" disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Save changes" : "Create user"}
            </Button>
        </form>
    );
}