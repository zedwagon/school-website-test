"use client";

import { Button, Input, Pagination } from "@school/ui";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface ContactMessage {
  archivedAt: string | null;
  createdAt: string;
  email: string;
  id: number;
  message: string;
  name: string;
  phone: string | null;
  subject: string;
}

interface MessagesClientProps {
  currentPage: number;
  initialSearch: string;
  messages: ContactMessage[];
  totalCount: number;
}

const parseDate = (dateValue: string | Date | null | undefined) => {
  if (!dateValue) {
    return new Date();
  }
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === "string") {
    // Postgres timestamp format: "2026-02-08 03:59:40.747052"
    // We assume the database stores everything in UTC.
    try {
      const parts = dateValue.split(/[- :.T]/);
      if (parts.length >= 6) {
        // Year, Month (0-indexed), Day, Hour, Minute, Second
        return new Date(
          Date.UTC(
            Number.parseInt(parts[0], 10),
            Number.parseInt(parts[1], 10) - 1,
            Number.parseInt(parts[2], 10),
            Number.parseInt(parts[3], 10),
            Number.parseInt(parts[4], 10),
            Number.parseInt(parts[5], 10),
          ),
        );
      }
    } catch (e) {
      console.error("Error parsing date string:", e);
    }

    // Fallback for other formats
    const isoStr = dateValue.replace(" ", "T");
    const withTz =
      isoStr.includes("Z") || isoStr.includes("+") ? isoStr : `${isoStr}Z`;
    return new Date(withTz);
  }

  return new Date(dateValue);
};

export default function MessagesClient({
  messages,
  initialSearch,
  totalCount,
  currentPage,
}: MessagesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );

  const updateSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      params.delete("page"); // Reset to page 1

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      clearTimeout(
        (window as unknown as Record<string, ReturnType<typeof setTimeout>>)
          .__msgSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__msgSearchTimer = setTimeout(() => {
        updateSearchParams(value);
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pr-10 pl-10"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search messages..."
            value={search}
          />
          {search && (
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              onClick={() => handleSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-gray-500 text-sm">
          Showing {totalCount} messages
        </div>
      </div>

      {/* Messages List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-gray-200 border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages?.map((msg: ContactMessage) => (
                <tr className="transition-colors hover:bg-gray-50" key={msg.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center font-medium text-gray-900 text-sm">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        {format(parseDate(msg.createdAt), "MMM dd, yyyy")}
                      </div>
                      <div className="mt-0.5 flex items-center text-gray-500 text-xs">
                        <Clock className="mr-1.5 h-3 w-3 text-gray-400" />
                        {format(parseDate(msg.createdAt), "hh:mm a")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-semibold text-gray-900 text-sm">
                        {msg.name}
                      </div>
                      <div className="mt-0.5 flex items-center text-gray-500 text-xs">
                        <Mail className="mr-1 h-3 w-3 text-gray-400" />
                        {msg.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate font-medium text-gray-900 text-sm">
                      {msg.subject}
                    </div>
                    <div className="mt-0.5 max-w-md truncate text-gray-500 text-xs">
                      {msg.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => setSelectedMessage(msg)}
                      size="sm"
                      variant="ghost"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {messages?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-gray-500 italic"
                    colSpan={4}
                  >
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / 10)}
      />

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200">
          <div className="zoom-in-95 flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-xl bg-white shadow-2xl duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-gray-100 border-b bg-indigo-50/50 p-6">
              <div>
                <h3 className="mb-1 font-bold text-gray-900 text-xl">
                  Message Details
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Sent on{" "}
                  {format(
                    parseDate(selectedMessage.createdAt),
                    "MMMM dd, yyyy @ hh:mm a",
                  )}
                </div>
              </div>
              <button
                className="rounded-full border border-transparent p-1 text-gray-400 shadow-sm transition-colors hover:border-gray-200 hover:bg-white hover:text-gray-600"
                onClick={() => setSelectedMessage(null)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <span className="mb-2 block font-bold text-gray-400 text-xs uppercase tracking-wider">
                    Sender Information
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center font-semibold text-gray-900 text-sm">
                      <User className="mr-2 h-4 w-4 text-indigo-500" />
                      {selectedMessage.name}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="mr-2 h-4 w-4 text-indigo-500" />
                      {selectedMessage.email}
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="mr-2 h-4 w-4 text-indigo-500" />
                        {selectedMessage.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-4">
                  <span className="mb-2 block font-bold text-indigo-400 text-xs uppercase tracking-wider">
                    Subject
                  </span>
                  <div className="flex items-start">
                    <MessageSquare className="mt-0.5 mr-2 h-4 w-4 text-indigo-500" />
                    <span className="font-bold text-indigo-900 text-sm leading-tight">
                      {selectedMessage.subject}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block font-bold text-gray-400 text-xs uppercase tracking-wider">
                  Message Content
                </span>
                <div className="min-h-[200px] whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-6 text-gray-800 leading-relaxed shadow-inner">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-gray-100 border-t p-6">
              <Button
                className="px-6"
                onClick={() => setSelectedMessage(null)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
