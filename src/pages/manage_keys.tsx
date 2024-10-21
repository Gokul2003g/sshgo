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
      } catch (error) {
        console.error('Error deleting key:', error);
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
        // Immediately add the new key to the list
        setKeys((prevKeys) => [...prevKeys, filename]);  // Add the new key here
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
        setKeys((prevKeys) => [...prevKeys, newFilename]); // Add the new key here
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative h-screen">
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2 text-xl">File Name</label> {/* Increased font size */}
            <Input
              className="p-2 border rounded text-lg" // Increased input font size
              value={filename}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
              placeholder="Enter key file name"
              style={{ width: '300px' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2 text-xl">Algorithm</label> {/* Increased font size */}
            <select
              value={algorithm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAlgorithm(e.target.value)}
              className="p-2 border rounded bg-white text-black text-lg" // Increased select font size
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
            <label className="text-lg font-bold mb-2 text-xl">Password</label> {/* Increased font size */}
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="text-lg" // Increased input font size
              style={{ width: '200px' }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button onClick={handleGenerateKeys} className="bg-blue-500 text-white p-2 rounded text-lg" style={{ width: '200px', height: '50px' }}> {/* Increased button text size */}
            Generate Keys
          </Button>
        </div>

        <div className="flex justify-center mb-4">
          <label className="text-lg font-bold mr-4 text-xl">Role:</label> {/* Increased font size */}
          <Button
            onClick={() => setRole(role === "user" ? "host" : "user")}
            className={`p-2 rounded ${role === "user" ? "bg-blue-500 text-white" : "bg-gray-600 text-white"} text-lg`} // Increased button text size
            style={{ width: '100px' }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </div>

        {/* Properly position the Add CA Key button above the SSH keys */}
        <div className="flex justify-center mb-4"> 
          <Button onClick={() => setShowCaKeyModal(true)} className="bg-blue-500 text-white p-2 rounded text-lg" style={{ width: '200px', height: '50px' }}> {/* Increased button text size */}
            Add CA Key File
          </Button>
        </div>

        {message && (
          <div
            className={`mt-2 ${
              message.includes("successfully") ? "text-green-500" : "text-red-500"
            } text-lg`} // Increased message text size
          >
            {message}
          </div>
        )}

        <h2 className="text-xl font-bold mt-6">SSH Keys</h2> {/* Increased heading font size */}
        <ul className="list-disc ml-5 mt-2">
          {keys.length === 0 ? (
            <li className="text-lg">No SSH keys found.</li> // Increased text size
          ) : (
            keys.map((key) => (
              <li key={key} className="flex justify-between items-center my-2 text-lg"> {/* Increased text size */}
                {key}
                <Button
                  onClick={() => handleDelete(key)}
                  className="ml-4 bg-red-500 text-white p-1 rounded"
                >
                  Delete
                </Button>
              </li>
            ))
          )}
        </ul>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete the key: {confirmDelete}?</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={cancelDeletion} className="bg-gray-300 text-black p-2 rounded mr-2">
                  Cancel
                </Button>
                <Button onClick={confirmDeletion} className="bg-red-500 text-white p-2 rounded">
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Generate Keys</h2>
            <p>{modalError && <span className="text-red-500">{modalError}</span>}</p>
            <div className="mb-4">
              <label className="font-bold text-xl">New File Name</label> {/* Increased font size */}
              <Input
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                placeholder="Enter new file name"
                className="text-lg" // Increased input font size
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleReEnterFileName} className="bg-blue-500 text-white p-2 rounded mr-2 text-lg"> {/* Increased button text size */}
                Generate
              </Button>
              <Button onClick={() => setShowModal(false)} className="bg-gray-300 text-black p-2 rounded text-lg">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCaKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add CA Key File</h2>
            <div className="mb-4">
              <Button onClick={handleFileSelect} className="bg-blue-500 text-white p-2 rounded text-lg"> {/* Increased button text size */}
                Select CA Key File
              </Button>
              {caKeyFileName && <span className="ml-2 text-lg">{caKeyFileName}</span>} {/* Increased text size */}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddCAKey} className="bg-blue-500 text-white p-2 rounded mr-2 text-lg"> {/* Increased button text size */}
                Add Key
              </Button>
              <Button onClick={() => setShowCaKeyModal(false)} className="bg-gray-300 text-black p-2 rounded text-lg">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageKeys;


