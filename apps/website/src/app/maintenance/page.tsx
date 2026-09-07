import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm max-w-lg border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Under Scheduled Maintenance
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We are currently upgrading our systems to bring you a better
          experience. The website will be back online shortly. Thank you for
          your patience!
        </p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-blue-600 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
