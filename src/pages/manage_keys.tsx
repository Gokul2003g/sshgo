import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/tauri";

const ManageKeys: React.FC = () => {
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
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
        setMessage(`Key generated successfully! Filename: ${filename}`);
        setKeys((prevKeys) => [...prevKeys, filename]);
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

  const resetState = () => {
    setFilename("");
    setAlgorithm("choose");
    setPassword("");
    setOverwrite(false);
    setNewFilename("");
    setCaKeyFile(null);
    setCaKeyFileName("");
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative h-screen">
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2">File Name</label>
            <Input
              className="p-2 border rounded"
              value={filename}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
              placeholder="Enter key file name"
              style={{ width: '300px' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAlgorithm(e.target.value)}
              className="p-2 border rounded bg-white text-black"
              style={{ width: '150px', height: '50px' }}
            >
              <option value="choose">Choose</option>
              <option value="rsa">RSA</option>
              <option value="ecdsa">ECDSA</option>
              <option value="ed25519">ED25519</option>
            </select>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ width: '200px' }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button onClick={handleGenerateKeys} className="bg-blue-500 text-white p-2 rounded" style={{ width: '200px', height: '50px' }}>
            Generate Keys
          </Button>
          <Button onClick={() => setShowCaKeyModal(true)} className="bg-green-500 text-white p-2 rounded ml-4" style={{ width: '200px', height: '50px' }}>
            Add CA Key
          </Button>
        </div>
        <h2 className="text-lg font-bold mb-2">Existing Keys</h2>
        <ul className="list-disc list-inside">
          {keys.map((key) => (
            <li key={key} className="flex justify-between items-center mb-2">
              <span>{key}</span>
              <div>
                <Button onClick={() => handleRenameKey(key)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                  Rename
                </Button>
                <Button onClick={() => setConfirmDelete(key)} className="bg-red-500 text-white p-1 rounded">
                  Delete
                </Button>
              </div>
            </li> 
          ))}
          {/* Messages */}
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {modalError && <p className="text-red-500 mt-4">{modalError}</p>}
        </ul> 

        {confirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-black p-4 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
              <p>Are you sure you want to delete {confirmDelete}?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={confirmDeletion} className="bg-red-500 text-white p-2 rounded">Yes</Button>
                <Button onClick={cancelDeletion} className="bg-gray-500 text-white p-2 rounded">No</Button>
              </div>
            </div>
          </div>
        )}

        {keyToRename && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-black p-4 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">Rename Key</h3>
              <Input
                value={renamedKey}
                onChange={(e) => setRenamedKey(e.target.value)}
                placeholder="Enter new key name"
                className="border rounded p-2 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={confirmRenameKey} className="bg-green-500 text-white p-2 rounded">Rename</Button>
                <Button onClick={cancelRename} className="bg-gray-500 text-white p-2 rounded">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {showCaKeyModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-blue p-4 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">Add CA Key</h3>
              <Button onClick={handleFileSelect} className="bg-blue-500 text-white p-2 rounded mb-4">
                Select CA Key File
              </Button>
              <p>{caKeyFileName}</p>
              <div className="bg-black flex justify-between mb-4">
                <label className="mr-2">Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-black border rounded">
                  <option className="bg-black" value="user">User</option>
                  <option className="bg-black" value="host">Host</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={handleAddCAKey} className="bg-green-500 text-white p-2 rounded">Add CA Key</Button>
                <Button onClick={() => setShowCaKeyModal(false)} className="bg-gray-500 text-white p-2 rounded">Cancel</Button>
              </div>
            </div>
          </div>
        )} 
      </div>
    </div>
  );
};

export default ManageKeys;

