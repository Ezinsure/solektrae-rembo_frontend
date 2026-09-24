"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { LoginFormValues, loginSchema } from "@/lib/form-schema";
import { useState } from "react";
import IremboLogo from "../../../public/favicon.ico";

const LoginForm = () => {
  const login = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = searchParams.get("from") || "/admin/customers";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onSuccess: () => {
        router.push(redirectTo);
      },
    });
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f4f3fb] p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl  overflow-hidden">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-14">
          <div className="flex justify-between">
            <h1 className="text-3xl font-semibold text-[#2b2560] leading-tight">
              Hello,
              <br />
              Welcome back
            </h1>
            <div>
              <Image
                src={IremboLogo}
                alt="Irembo Logo"
                width={60}
                height={34}
                priority
              />
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
            <div>
              <input
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="w-full border-0 border-b border-gray-200 focus:border-[#004EA4] outline-none py-2 text-sm placeholder:text-gray-400 transition-colors bg-transparent"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full border-0 border-b border-gray-200 focus:border-[#004EA4] outline-none py-2 text-sm placeholder:text-gray-400 transition-colors bg-transparent"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#004EA4]"
                />
                Show password
              </label>
            </div>
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[#004EA4] hover:bg-[#042f5e] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {login.isPending ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
export default LoginForm;
