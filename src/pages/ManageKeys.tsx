import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

const ManageKeys = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
 
  useEffect(() => {
    async function fetchKeys() {
      try {
        const fetchedKeys: string[] = await invoke('list_ssh_keys_command');
        setKeys(fetchedKeys);
      } catch (error) {
        console.error('Error fetching keys:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchKeys();
  }, []);

  // Function to handle delete button click
  const handleDelete = (keyName: string) => {
    setConfirmDelete(keyName);
  };

  // Function to confirm deletion
  const confirmDeletion = async () => {
    if (confirmDelete) {
      try {
        await invoke('delete_ssh_key_command', { keyName: confirmDelete });
        setKeys((prevKeys) => prevKeys.filter((key) => key !== confirmDelete));
        setConfirmDelete(null); // Close dialog
      } catch (error) {
        console.error('Error deleting key:', error);
      }
    }
  };

  // Function to cancel deletion
  const cancelDeletion = () => {
    setConfirmDelete(null); // Close dialog
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage SSH Keys</h1>
      {keys.length === 0 ? (
        <p>No SSH keys found.</p>
      ) : (
        <ul className="list-disc pl-5">
          {keys.map((key) => (
            <li key={key} className="flex justify-between items-center mb-2">
              <span>{key}</span>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleDelete(key)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete "{confirmDelete}" key?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={confirmDeletion}
              >
                Confirm
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={cancelDeletion}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageKeys;


