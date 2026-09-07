"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@school/api/auth/action";
import { Button, Card, Input, Label } from "@school/ui";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordFormData) {
    startTransition(async () => {
      const res = await changePassword(data.currentPassword, data.newPassword);

      if (res.success) {
        toast.success("Password changed successfully");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(res.error || "Failed to change password");
      }
    });
  }

  return (
    <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Security Credentials
            </h3>
            <p className="text-gray-500 text-xs">Update your login password</p>
          </div>
        </div>
      </div>

      <form className="space-y-5 p-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Current Password */}
        <div className="space-y-2">
          <Label
            className="text-gray-700 text-sm font-medium"
            htmlFor="currentPassword"
          >
            Current Password
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <Input
              id="currentPassword"
              placeholder="••••••••"
              type={showCurrentPassword ? "text" : "password"}
              {...form.register("currentPassword")}
              className="pl-10 pr-10 h-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
              disabled={isPending}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              type="button"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.currentPassword && (
            <p className="text-red-500 text-xs">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label
            className="text-gray-700 text-sm font-medium"
            htmlFor="newPassword"
          >
            New Password
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="newPassword"
              placeholder="8+ characters"
              type={showNewPassword ? "text" : "password"}
              {...form.register("newPassword")}
              className="pl-10 pr-10 h-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
              disabled={isPending}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
              type="button"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-red-500 text-xs">
              {form.formState.errors.newPassword.message}
            </p>
          )}
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-slate-500 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-700">
                Requirements:
              </span>{" "}
              At least 8 characters, including uppercase, lowercase, and a
              number.
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            className="text-gray-700 text-sm font-medium"
            htmlFor="confirmPassword"
          >
            Confirm New Password
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              {...form.register("confirmPassword")}
              className="pl-10 pr-10 h-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
              disabled={isPending}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type="button"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
