"use client";

import { getStudentEnrollmentDetails } from "@school/api/enrollment/query";
import {
	resetStudentPassword,
	updateStudentBioData,
} from "@school/api/students/action";
import {
	Button,
	DatePicker,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@school/ui";
import { Key, Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface EditStudentDialogProps {
	onClose: () => void;
	onSuccess?: () => void;
	schoolYearId?: number;
	studentId: number | null;
}

export function EditStudentDialog({
	studentId,
	onClose,
	onSuccess,
	schoolYearId,
}: EditStudentDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [isLoading, setIsLoading] = useState(false);
	const [isResetting, setIsResetting] = useState(false);
	const [generatedPassword, setGeneratedPassword] = useState<string | null>(
		null,
	);

	// Bio-data
	const [firstName, setFirstName] = useState("");
	const [middleName, setMiddleName] = useState("");
	const [lastName, setLastName] = useState("");
	const [suffix, setSuffix] = useState("");
	const [birthdate, setBirthdate] = useState("");
	const [gender, setGender] = useState<"male" | "female" | "">("");
	const [lrn, setLrn] = useState("");
	const [parentName, setParentName] = useState("");
	const [parentContact, setParentContact] = useState("");
	const [fatherName, setFatherName] = useState("");
	const [motherMaidenName, setMotherMaidenName] = useState("");
	const [enrollmentFormId, setEnrollmentFormId] = useState<number | null>(null);

	useEffect(() => {
		if (!studentId) {
			return;
		}
		setIsLoading(true);
		getStudentEnrollmentDetails(studentId, schoolYearId)
			.then((result) => {
				if (!result.error && result.data) {
					const d = result.data;
					setFirstName(d.firstName || "");
					setMiddleName(d.middleName || "");
					setLastName(d.lastName || "");
					setSuffix(d.suffix || "");
					setBirthdate(
						d.birthdate
							? new Date(d.birthdate).toISOString().split("T")[0]
							: "",
					);
					setGender((d.gender as "male" | "female") || "");
					setLrn(d.lrn || "");
					setParentName(d.parentName || "");
					setParentContact(d.parentContact || "");
					setEnrollmentFormId(d.enrollmentFormId || null);

					setFatherName(d.fatherName || "");
					setMotherMaidenName(d.motherMaidenName || "");
				}
			})
			.finally(() => setIsLoading(false));
	}, [studentId, schoolYearId]);

	function handleResetPassword() {
		if (!studentId) return;
		setIsResetting(true);
		resetStudentPassword(studentId)
			.then((res) => {
				if (res.error) {
					toast.error(res.error);
				} else {
					setGeneratedPassword(res.defaultPassword ?? null);
					toast.success("Password reset successfully");
				}
			})
			.finally(() => setIsResetting(false));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!(studentId && firstName && lastName && birthdate && gender)) {
			toast.error("Please fill in all required fields");
			return;
		}
		if (lrn && !/^\d{12}$/.test(lrn)) {
			toast.error("LRN must be exactly 12 digits");
			return;
		}

		startTransition(async () => {
			const payload = {
				firstName,
				middleName: middleName || undefined,
				lastName,
				suffix: suffix || undefined,
				birthdate,
				gender: gender as "male" | "female",
				lrn: lrn || undefined,
				fatherName: fatherName || undefined,
				motherMaidenName: motherMaidenName || undefined,
				guardianName: parentName || undefined,
				guardianContact: parentContact || undefined,
				enrollmentFormId: enrollmentFormId || undefined,
			};

			const res = await updateStudentBioData(studentId, payload);
			if (res.error) {
				toast.error(res.error);
			} else {
				toast.success("Student details updated successfully");
				onSuccess?.();
				onClose();
			}
		});
	}

	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={!!studentId}>
			<DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Student Details</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
					</div>
				) : (
					<form className="space-y-6 py-4" onSubmit={handleSubmit}>
						<Tabs className="w-full" defaultValue="basic">
							<TabsList className="grid h-auto w-full grid-cols-3">
								<TabsTrigger className="min-w-0 whitespace-normal px-1 py-2 text-xs sm:text-sm" value="basic">Basic Information</TabsTrigger>
								<TabsTrigger className="min-w-0 whitespace-normal px-1 py-2 text-xs sm:text-sm" value="family">Family Information</TabsTrigger>
								<TabsTrigger className="min-w-0 whitespace-normal px-1 py-2 text-xs sm:text-sm" value="security">Account Security</TabsTrigger>
							</TabsList>

							<TabsContent className="space-y-4 pt-4" value="basic">
								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="edit-student-firstName">
											First Name <span className="text-red-500">*</span>
										</Label>
										<Input
											id="edit-student-firstName"
											onChange={(e) => setFirstName(e.target.value)}
											required
											value={firstName}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-middleName">Middle Name</Label>
										<Input
											id="edit-student-middleName"
											onChange={(e) => setMiddleName(e.target.value)}
											value={middleName}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-lastName">
											Last Name <span className="text-red-500">*</span>
										</Label>
										<Input
											id="edit-student-lastName"
											onChange={(e) => setLastName(e.target.value)}
											required
											value={lastName}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-suffix">Suffix</Label>
										<Input
											id="edit-student-suffix"
											onChange={(e) => setSuffix(e.target.value)}
											value={suffix}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
									<div>
										<Label>
											Birthdate <span className="text-red-500">*</span>
										</Label>
										<DatePicker aria-label="Birthdate" onChange={setBirthdate} value={birthdate} />
									</div>
									<div>
										<Label>
											Gender <span className="text-red-500">*</span>
										</Label>
										<Select
											onValueChange={(v) => setGender(v as "male" | "female")}
											required
											value={gender}
										>
											<SelectTrigger aria-label="Gender">
												<SelectValue placeholder="Select..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="edit-student-lrn">LRN</Label>
										<Input
											id="edit-student-lrn"
											maxLength={12}
											onChange={(e) => {
												const val = e.target.value.replace(/\D/g, "");
												setLrn(val);
											}}
											value={lrn}
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent className="space-y-4 pt-4" value="family">
								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="edit-student-parentName">Guardian Name</Label>
										<Input
											id="edit-student-parentName"
											onChange={(e) => setParentName(e.target.value)}
											value={parentName}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-parentContact">Guardian Contact</Label>
										<Input
											id="edit-student-parentContact"
											onChange={(e) => setParentContact(e.target.value)}
											value={parentContact}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-fatherName">Father&apos;s Name</Label>
										<Input
											id="edit-student-fatherName"
											onChange={(e) => setFatherName(e.target.value)}
											value={fatherName}
										/>
									</div>
									<div>
										<Label htmlFor="edit-student-motherMaidenName">Mother&apos;s Maiden Name</Label>
										<Input
											id="edit-student-motherMaidenName"
											onChange={(e) => setMotherMaidenName(e.target.value)}
											value={motherMaidenName}
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent className="space-y-4 pt-4" value="security">
								{generatedPassword ? (
									<div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
										<div>
											<p className="text-xs text-green-600 font-medium">
												New Password Generated:
											</p>
											<p className="text-lg font-mono font-bold text-green-700">
												{generatedPassword}
											</p>
											<p className="text-xs text-green-600 mt-1">
												Please copy this password now. It will not be shown
												again.
											</p>
										</div>
										<Button
											aria-label="Dismiss generated password"
											className="text-green-700 hover:bg-green-100"
											onClick={() => setGeneratedPassword(null)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600">
												Reset student password.
											</p>
											<p className="text-xs text-gray-400">
												Format: MPPSI-Year-Random (e.g., MPPSI-2026-XXXXXX)
											</p>
										</div>
										<Button
											disabled={isResetting || isPending}
											onClick={handleResetPassword}
											size="sm"
											type="button"
											variant="outline"
										>
											{isResetting ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Key className="mr-2 h-4 w-4" />
											)}
											Reset Password
										</Button>
									</div>
								)}
							</TabsContent>
						</Tabs>

						<DialogFooter className="pt-4">
							<Button
								disabled={isPending}
								onClick={onClose}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button disabled={isPending} type="submit">
								{isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
