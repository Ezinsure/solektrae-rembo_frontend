"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useRoles } from "@/hooks/useRoles";
import { useMyCompanies } from "@/hooks/useCompany";

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
  const { data: allRoles = [], isLoading: rolesLoading, isError: rolesError } = useRoles();
  const { data: companies = [] } = useMyCompanies();
  const isPending = createUser.isPending || updateUser.isPending;
  const [showPassword, setShowPassword] = useState(false);
  const schema = useMemo(() => getUserSchema(isEdit), [isEdit]);

  const isDev = companies.find((c: any) => c.isCurrent)?.role === "dev";

  const lockedDevUser = isEdit && user?.role === "dev" && !isDev;

  const roles = allRoles.filter(
    (r: any) => r.baseRole !== "dev" || isDev || (lockedDevUser && r.id === user?.roleId),
  );
  const roleItems = roles.map((r: any) => ({ value: r.id, label: r.name }));

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
      roleId: user?.roleId ?? "",
      password: "",
    },
  });

  const onSubmit = (data: UserFormValues) => {
    const { password, ...rest } = data;
    const payload: any = isEdit && !password ? rest : data;


    if (lockedDevUser) delete payload.roleId;

    if (isEdit) {
      updateUser.mutate({ id: user.id, data: payload }, { onSuccess });
    } else {
      createUser.mutate(payload, { onSuccess });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
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

          {!isEdit && (
            <Field>
              <FieldLabel htmlFor="password" className="text-sm opacity-80">
                Password *
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
          )}

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
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  items={roleItems} 
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "")}
                  disabled={rolesLoading || rolesError || lockedDevUser}
                >
                  <SelectTrigger className="w-full">
                    {rolesLoading ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading roles…
                      </span>
                    ) : (
                      <SelectValue placeholder="Select a role" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {rolesError && (
              <p className="text-xs text-red-500 mt-1">Could not load roles.</p>
            )}
            {lockedDevUser && (
              <p className="text-xs text-muted-foreground mt-1">Only a developer can change this role.</p>
            )}
            {errors.roleId && (
              <p className="text-xs text-red-500 mt-1">{errors.roleId.message}</p>
            )}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-1/2 flex mx-auto mt-6" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Create user"}
        </Button>
      </form>
    </div>
  );
}