import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/tauri";

const ManageKeys: React.FC = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<string>("choose");
  const [password, setPassword] = useState<string>("");
  const [overwrite, setOverwrite] = useState<boolean>(false);
  const [newFilename, setNewFilename] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [modalError, setModalError] = useState<string>("");
  const [caKeyFile, setCaKeyFile] = useState<File | null>(null);
  const [caKeyFileName, setCaKeyFileName] = useState<string>("");
  const [showCaKeyModal, setShowCaKeyModal] = useState<boolean>(false);
  const [role, setRole] = useState<string>("user");
  const [keyToRename, setKeyToRename] = useState<string | null>(null);
  const [renamedKey, setRenamedKey] = useState<string>("");

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

  const handleDelete = (keyName: string) => {
    setConfirmDelete(keyName);
  };

  const confirmDeletion = async () => {
    if (confirmDelete) {
      try {
        await invoke('delete_ssh_key_command', { keyName: confirmDelete });
        setKeys((prevKeys) => prevKeys.filter((key) => key !== confirmDelete));
        setConfirmDelete(null);
        setMessage(`Key ${confirmDelete} deleted successfully.`);
      } catch (error) {
        console.error('Error deleting key:', error);
        setMessage("Error deleting key.");
      }
    }
  };

  const cancelDeletion = () => {
    setConfirmDelete(null);
  };

  const handleGenerateKeys = async () => {
    if (filename === "") {
      setMessage("Please enter a file name for the key.");
      return;
    }

    if (algorithm === "choose") {
      setMessage("Please select an algorithm.");
      return;
    }

    try {
      const result = await invoke("generate_keys_with_filename_command", {
        algorithm,
        password,
        filename,
        overwrite,
      });

      if (result === 1) {
        setKeys((prevKeys) => [...prevKeys, filename]);
        setMessage(`Key generated successfully! Filename: ${filename}`);
        setShowModal(false);
        resetState();
      } else if (result === -1) {
        setShowModal(true);
        setModalError("");
      } else {
        setMessage("Error generating keys.");
      }
    } catch (err) {
      console.error("Error generating keys: ", err);
      setMessage("An unexpected error occurred.");
    }
  };

  const handleReEnterFileName = async () => {
    if (newFilename.trim() === "") {
      setModalError("Please enter a new file name.");
      return;
    }

    try {
      const result = await invoke("generate_keys_with_filename_command", {
        algorithm,
        password,
        filename: newFilename,
        overwrite: false,
      });

      if (result === 1) {
        setKeys((prevKeys) => [...prevKeys, newFilename]);
        setMessage(`Key generated successfully! Filename: ${newFilename}`);
        setShowModal(false);
        resetState();
      } else if (result === -1) {
        setModalError("New file name already exists. Please choose another name.");
      } else {
        setMessage("Error generating keys with the new file name.");
      }
    } catch (err) {
      console.error("Error checking new file name: ", err);
      setModalError("An unexpected error occurred.");
    }
  };

  const handleOverwrite = () => {
    setOverwrite(true);
    handleGenerateKeys();
  };

  const handleAddCAKey = async () => {
    if (!caKeyFile) {
      setMessage("Please select a CA key file.");
      return;
    }

    try {
      const result = await invoke("add_ca_key_command", {
        role,
        fileContent: await caKeyFile.text(),
        filename: caKeyFileName,
      });

      if (result === 1) {
        setMessage("CA key added successfully!");
        setCaKeyFile(null);
        setCaKeyFileName("");
        setShowCaKeyModal(false);
      } else {
        setMessage("Error adding CA key.");
      }
    } catch (err) {
      console.error("Error adding CA key: ", err);
      setMessage("An unexpected error occurred.");
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pub";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setCaKeyFile(target.files[0]);
        setCaKeyFileName(target.files[0].name);
      }
    };
    input.click();
  };

  const handleRenameKey = (keyName: string) => {
    setKeyToRename(keyName);
    setRenamedKey(keyName);
  };

  const confirmRenameKey = async () => {
    if (!keyToRename || !renamedKey) return;

    try {
      await invoke("rename_ssh_key_command", { oldName: keyToRename, newName: renamedKey });
      setKeys((prevKeys) =>
        prevKeys.map((key) => (key === keyToRename ? renamedKey : key))
      );
      setMessage(`Key renamed successfully from ${keyToRename} to ${renamedKey}`);
      setKeyToRename(null);
      setRenamedKey("");
    } catch (error) {
      console.error("Error renaming key:", error);
      setMessage("Error renaming key.");
    }
  };

  const cancelRename = () => {
    setKeyToRename(null);
    setRenamedKey("");
  };

  const resetState = () => {
    setFilename("");
    setAlgorithm("choose");
    setPassword("");
    setOverwrite(false);
    setNewFilename("");
    setCaKeyFile(null);
    setCaKeyFileName("");
    setMessage(""); // Reset the message state
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative h-screen">
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2 text-xl">File Name</label>
            <Input
              className="p-2 border rounded text-lg"
              value={filename}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
              placeholder="Enter key file name"
              style={{ width: '300px' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2 text-xl">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAlgorithm(e.target.value)}
              className="p-2 border rounded bg-white text-black text-lg"
              style={{ width: '150px', height: '50px' }}
            >
              <option value="choose">Choose</option>
              <option value="rsa">RSA</option>
              <option value="ecdsa">ECDSA</option>
              <option value="ed25519">ED25519</option>
              <option value="dsa">DSA</option>
            </select>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2 text-xl">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="text-lg"
              style={{ width: '200px' }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button onClick={handleGenerateKeys} className="bg-blue-500 text-white p-2 rounded text-lg">
            Generate Key
          </Button>
          <Button onClick={handleOverwrite} className="bg-blue-500 text-white p-2 rounded text-lg ml-2">
            Overwrite Key
          </Button>
          <Button onClick={() => setShowCaKeyModal(true)} className="bg-green-500 text-white p-2 rounded text-lg ml-2">
            Add CA Key
          </Button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-2 mt-4 text-lg ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </div>
        )}

        {confirmDelete && (
          <div className="flex justify-center mt-4">
            <div className="bg-white p-4 border rounded shadow">
              <p>Are you sure you want to delete {confirmDelete}?</p>
              <div className="flex space-x-4 mt-4">
                <Button onClick={confirmDeletion} className="bg-red-500 text-white p-2 rounded text-lg">
                  Yes
                </Button>
                <Button onClick={cancelDeletion} className="bg-gray-300 text-black p-2 rounded text-lg">
                  No
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Key Modal */}
        {keyToRename && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md w-96">
              <h2 className="text-lg font-bold mb-4">Rename Key</h2>
              <Input
                value={renamedKey}
                onChange={(e) => setRenamedKey(e.target.value)}
                placeholder="New filename"
                className="mb-4 p-2 border rounded"
              />
              <div className="flex justify-between">
                <Button onClick={confirmRenameKey} className="bg-blue-500 text-white p-2 rounded">
                  Confirm
                </Button>
                <Button onClick={cancelRename} className="bg-gray-300 text-black p-2 rounded">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add CA Key Modal */}
        {showCaKeyModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md w-96">
              <h2 className="text-lg font-bold mb-4">Add CA Key</h2>
              <Button onClick={handleFileSelect} className="bg-blue-500 text-white p-2 rounded text-lg w-full mb-4">
                Select CA Key File
              </Button>
              {caKeyFile && (
                <div>
                  <p>Selected File: {caKeyFileName}</p>
                  <Button onClick={handleAddCAKey} className="bg-blue-500 text-white p-2 rounded text-lg w-full mt-4">
                    Add CA Key
                  </Button>
                </div>
              )}
              <Button onClick={() => setShowCaKeyModal(false)} className="bg-gray-300 text-black p-2 rounded text-lg w-full mt-4">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Modal for Key Generation Error */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md w-96">
              <h2 className="text-lg font-bold mb-4">Filename Already Exists</h2>
              <p>Please enter a new filename:</p>
              <Input
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                placeholder="New filename"
                className="mb-4 p-2 border rounded"
              />
              <div className="flex justify-between">
                <Button onClick={handleReEnterFileName} className="bg-blue-500 text-white p-2 rounded">
                  Confirm
                </Button>
                <Button onClick={() => setShowModal(false)} className="bg-gray-300 text-black p-2 rounded">
                  Cancel
                </Button>
              </div>
              {modalError && <p className="text-red-600 mt-2">{modalError}</p>}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Existing Keys:</h2>
          <ul className="list-disc list-inside">
            {keys.map((key) => (
              <li key={key} className="flex justify-between items-center mb-2">
                <span>{key}</span>
                <div className="flex space-x-2">
                  <Button onClick={() => handleRenameKey(key)} className="bg-blue-500 text-white p-1 rounded text-sm">
                    Rename
                  </Button>
                  <Button onClick={() => handleDelete(key)} className="bg-red-500 text-white p-1 rounded text-sm">
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageKeys;

