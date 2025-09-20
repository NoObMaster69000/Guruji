import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  dbName: string;
  username: string;
  password?: string;
  dbUrl?: string;
}

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Omit<DatabaseConnection, 'id'> & { id?: string }) => void;
  connectionToEdit?: DatabaseConnection | null;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose, onSave, connectionToEdit }) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [dbName, setDbName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (connectionToEdit) {
      setName(connectionToEdit.name);
      setHost(connectionToEdit.host);
      setPort(connectionToEdit.port);
      setDbName(connectionToEdit.dbName);
      setUsername(connectionToEdit.username);
      setPassword(connectionToEdit.password || '');
      setDbUrl(connectionToEdit.dbUrl || '');
    } else {
      // Reset form
      setName('');
      setHost('localhost');
      setPort(5432);
      setDbName('');
      setUsername('');
      setPassword('');
      setDbUrl('');
    }
  }, [connectionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: connectionToEdit?.id, name, host, port, dbName, username, password, dbUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {connectionToEdit ? 'Edit Database Connection' : 'Add Database Connection'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connection Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., My Project DB" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host</label>
              <input type="text" value={host} onChange={(e) => setHost(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="localhost" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port</label>
              <input type="number" value={port} onChange={(e) => setPort(parseInt(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="5432" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Name</label>
              <input type="text" value={dbName} onChange={(e) => setDbName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="myapp_db" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="db_user" required />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500">
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DB URL (Optional)</label>
            <input type="text" value={dbUrl} onChange={(e) => setDbUrl(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="jdbc:postgresql://..." />
          </div>
          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90">
              Save Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};