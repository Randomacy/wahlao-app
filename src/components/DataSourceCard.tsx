"use client";

type DataSourceCardProps = {
  name: string;
  description: string;
  icon: string;
  isConnected: boolean;
  onToggle: () => void;
};

export default function DataSourceCard({
  name,
  description,
  icon,
  isConnected,
  onToggle,
}: DataSourceCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-full p-2 rounded-md ${
          isConnected
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {isConnected ? "✅ Connected" : "Connect"}
      </button>
    </div>
  );
}
