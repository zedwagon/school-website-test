"use client";

import { createTeacher } from "@school/api/faculty/action";
import { Button, Input, Label } from "@school/ui";
import { Loader2, RefreshCw, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface CreateTeacherDialogProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  open: boolean;
}

export function CreateTeacherDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTeacherDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }

  function generatePassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createTeacher({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        password,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Teacher created successfully");
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h3 className="font-semibold text-gray-900 text-lg">
            Add New Teacher
          </h3>
          <button onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  value={firstName}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  value={lastName}
                />
              </div>
            </div>

            <div>
              <Label>Middle Name (Optional)</Label>
              <Input
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Optional"
                value={middleName}
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex space-x-2">
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  type="text"
                  value={password}
                />
                <Button
                  onClick={generatePassword}
                  size="icon"
                  title="Generate Random"
                  type="button"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Teacher"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
