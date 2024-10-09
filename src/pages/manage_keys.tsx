import React, { useState } from "react";
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
        setShowModal(false);
        resetState();
      } else if (result === -1) {
        setShowModal(true);
        setModalError(""); // Clear modal error on first open
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
        fileContent: await caKeyFile.text(),
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

  return (
    <div className="relative h-screen">
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
        {/* Key Generation Section */}
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
              <option value="dsa">DSA</option>
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
        </div>

        {/* CA Key Section */}
        <div style={{ position: 'absolute', bottom: '1/4rem', left: '1rem'} }>
          <Button onClick={() => setShowCaKeyModal(true)} className="bg-blue-500 text-white p-2 rounded" style={{ width: '200px', height: '50px' }}>
            Add CA Key File
          </Button>
        </div>

        {/* Success or Error Message */}
        {message && (
          <div
            className={`mt-4 text-center ${
              message.includes("Please") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Modal for adding CA Key */}
      {showCaKeyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black text-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add CA Key</h2>
            <div className="flex flex-col mb-4">
              <button
                onClick={handleFileSelect}
                className="bg-blue-500 text-white p-2 rounded mb-2"
                style={{ width: '100%' }}
              >
                Select CA Key File
              </button>
              {caKeyFileName && (
                <span className="text-sm text-gray-500 mb-4">{caKeyFileName}</span>
              )}
              <button
                onClick={handleAddCAKey}
                className="bg-green-500 text-white p-2 rounded w-full"
              >
                Add CA Key
              </button>
              {message && (
                <div className="mt-4 text-red-500 text-center">
                  {message}
                </div>
              )}
            </div>
            <button onClick={() => setShowCaKeyModal(false)} className="bg-gray-600 text-white p-2 rounded w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for file name conflict */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black text-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">File Already Exists</h2>
            <div className="flex">
              <div className="flex-1 flex flex-col">
                <input
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="Enter new file name"
                  className="border p-2 rounded bg-gray-800 text-white w-full mb-2"
                />
                <button
                  onClick={handleReEnterFileName}
                  className="bg-blue-500 text-white p-2 rounded w-full"
                >
                  Submit New Name
                </button>
              </div>
              <div className="border-l border-gray-600 mx-4"></div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <button
                  onClick={handleOverwrite}
                  className="bg-green-500 text-white p-2 rounded w-full"
                >
                  Overwrite
                </button>
              </div>
            </div>

            {modalError && (
              <div className="mt-4 text-red-500 text-center">
                {modalError}
              </div>
            )}

            <button onClick={() => setShowModal(false)} className="bg-gray-600 text-white p-2 rounded w-full mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageKeys;


