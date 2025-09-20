import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Square, Database } from 'lucide-react';
import { DatabaseConnection } from './DatabaseModal';

interface DatabaseListProps {
  selectedDbs: string[];
  setSelectedDbs: (ids: string[]) => void;
}

export const DatabaseList: React.FC<DatabaseListProps> = ({ selectedDbs, setSelectedDbs }) => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [filteredConns, setFilteredConns] = useState<DatabaseConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, you would fetch this from an endpoint.
    // For now, we'll assume connections are passed down or managed in App.tsx
    // and this component might fetch its own list in the future.
    // setConnections(data);
    // setFilteredConns(data);
  }, []);

  useEffect(() => {
    const results = connections.filter(conn =>
      conn.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConns(results);
  }, [searchTerm, connections]);

  const handleSelectDb = (id: string) => {
    const newSelectedDbs = selectedDbs.includes(id)
      ? selectedDbs.filter(dbId => dbId !== id)
      : [...selectedDbs, id];
    setSelectedDbs(newSelectedDbs);
  };

  // This component is ready for when you fetch DBs from an API.
  // For now, it won't display anything until the `connections` state is populated.
  // The logic is being added to Sidebar.tsx to display the list from props.

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      {/* The list rendering will be handled in Sidebar.tsx for now */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 -mr-2">
        {/* This part will be active when you fetch connections here */}
      </div>
    </div>
  );
};