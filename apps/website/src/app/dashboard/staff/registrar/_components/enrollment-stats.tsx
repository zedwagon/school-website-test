"use client";

import { Card } from "@school/ui";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Stethoscope,
  Users,
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EnrollmentStatsProps {
  initialData?: {
    total: number;
    pendingForm: number;
    pendingPhysical: number;
    pendingPayment: number;
    enrolled: number;
  };
}

export function EnrollmentStats({ initialData }: EnrollmentStatsProps) {
  const { data: swrData, isLoading } = useSWR("/api/registrar/stats", fetcher, {
    fallbackData: initialData ? { data: initialData } : undefined,
    refreshInterval: 30000,
  });

  const stats = swrData?.data;

  const statCards = [
    {
      label: "Total Students",
      value: stats?.total || 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "from-indigo-50/50 to-white",
      ringColor: "ring-indigo-100/50",
      iconBg: "bg-indigo-100/50",
    },
    {
      label: "Pending Forms",
      value: stats?.pendingForm || 0,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "from-orange-50/50 to-white",
      ringColor: "ring-orange-100/50",
      iconBg: "bg-orange-100/50",
    },
    {
      label: "Pending Clinic",
      value: stats?.pendingPhysical || 0,
      icon: Stethoscope,
      color: "text-emerald-600",
      bgColor: "from-emerald-50/50 to-white",
      ringColor: "ring-emerald-100/50",
      iconBg: "bg-emerald-100/50",
    },
    {
      label: "Pending Payment",
      value: stats?.pendingPayment || 0,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "from-blue-50/50 to-white",
      ringColor: "ring-blue-100/50",
      iconBg: "bg-blue-100/50",
    },
    {
      label: "Enrolled",
      value: stats?.enrolled || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "from-green-50/50 to-white",
      ringColor: "ring-green-100/50",
      iconBg: "bg-green-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            className={cn(
              "relative overflow-hidden border-none bg-gradient-to-br p-6 shadow-sm ring-1 transition-all hover:shadow-md",
              stat.bgColor,
              stat.ringColor,
            )}
            key={stat.label}
          >
            {isLoading && !stats ? (
              <div className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      stat.iconBg,
                      stat.color,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {isLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-bold text-3xl tracking-tight text-gray-900",
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            )}
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
              <Icon className="h-24 w-24 rotate-12" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
