import { getContactMessages } from "@school/api/registrar/action";
import MessagesClient from "./_components/messages-client";

export const metadata = {
  title: "Contact Messages - Registrar Portal",
};

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

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function ContactMessagesPage({ searchParams }: PageProps) {
  const { search, page } = await searchParams;
  const currentPage = page ? Number.parseInt(page, 10) || 1 : 1;

  const result = await getContactMessages(search, currentPage);

  if (!result.success || !("data" in result)) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Error loading messages:{" "}
          {"error" in result ? result.error : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900">Contact Messages</h1>
          <p className="mt-1 text-gray-600">
            View messages sent by visitors through the contact form
          </p>
        </div>

        <MessagesClient
          currentPage={currentPage}
          initialSearch={search || ""}
          messages={result.data as ContactMessage[]}
          totalCount={result.totalCount || 0}
        />
      </div>
    </div>
  );
}
