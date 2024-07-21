// src/components/PKA.jsx
import { Button, Option, Select } from "@material-tailwind/react";
import { invoke } from "@tauri-apps/api";
import React, { useState } from "react";

const PKA = () => {
  const [algorithm, setAlgorithm] = useState("rsa");
  const [password, setPassword] = useState("");
  const [filename, setFilename] = useState(""); // State for the file name

  async function generate_keys() {
    let currentFilename = filename;
    let success = false;

    while (!success) {
      try {
        console.log("Attempting to generate keys with filename:", currentFilename);
        const result = await invoke("generate_keys_with_filename", { algorithm, password, filename: currentFilename, overwrite: false });
        console.log(result); // Log successful key generation
        success = true;
      } catch (err) {
        console.error("Failed to generate keys:", err);
        if (err.includes("File already exists")) {
          const userChoice = prompt("File already exists. Do you want to overwrite it? (yes/no)");

          if (userChoice && userChoice.toLowerCase() === "yes") {
            console.log("Overwriting file:", currentFilename);
            try {
              const result = await invoke("generate_keys_with_filename", { algorithm, password, filename: currentFilename, overwrite: true });
              console.log(result); // Log successful key generation
              success = true;
            } catch (overwriteErr) {
              console.error("Failed to overwrite keys:", overwriteErr);
              alert(overwriteErr);
              break;
            }
          } else {
            let newFilename = prompt("Please enter a new filename:");
            if (newFilename) {
              currentFilename = newFilename; // Update the current filename
              console.log("Trying new filename:", newFilename);
            } else {
              alert("You must provide a filename.");
              break;
            }
          }
        } else {
          alert(err); // Show other errors to the user
          break;
        }
      }
    }
  }

  async function secureCopy(username) {
    console.log("Connecting with username:", username);
    await invoke("secure_copy", { username })
      .then(() => console.log("Secure copy command sent successfully"))
      .catch(err => console.error("Failed to execute secure copy:", err));
  }

  async function connectSSH(username) {
    console.log("Connecting SSH with username:", username);
    await invoke("connect_ssh", { username })
      .then(() => console.log("SSH command sent successfully"))
      .catch(err => console.error("Failed to execute SSH connection:", err));
  }

  return (
    <div className="flex flex-col gap-8 items-center h-fit justify-center font-bold">
      <div className="flex flex-col md:flex-row gap-16">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            secureCopy(username);
          }}
        >
          <input
            type="text"
            placeholder="user@ipaddress"
            onChange={(e) => setUsername(e.currentTarget.value)}
            className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
          />
          <Button type="submit" color="blue" ripple="light">
            Secure Copy
          </Button>
        </form>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            connectSSH(username);
          }}
        >
          <input
            type="text"
            placeholder="user@ipaddress"
            onChange={(e) => setUsername(e.currentTarget.value)}
            className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
          />
          <Button type="submit" color="blue" ripple="light">
            Connect
          </Button>
        </form>
      </div>

      <form
        className="flex flex-col max-w-lg w-4/6 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          generate_keys();
        }}
      >
        <label className="text-white" htmlFor="algo">
          Select Key-Gen Algorithm
        </label>
        <Select
          variant="static"
          size="lg"
          id="algo"
          lockScroll
          className="bg-gray-900 text-white"
          onChange={(value) => setAlgorithm(value)}
        >
          <Option value="rsa">RSA</Option>
          <Option value="dsa">DSA</Option>
          <Option value="ecdsa">ECDSA</Option>
          <Option value="ecdsa-sk">ECDSA-SK</Option>
          <Option value="ed25519">ED25519</Option>
          <Option value="ed25519-sk">ED25519-SK</Option>
        </Select>
        <input
          type="text"
          placeholder="Filename for key (e.g., id_rsa)"
          onChange={(e) => setFilename(e.currentTarget.value)}
          className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
        />
        <input
          type="text"
          placeholder="Password for key"
          onChange={(e) => setPassword(e.currentTarget.value)}
          className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
        />
        <Button type="submit" color="blue" ripple="light">
          Generate
        </Button>
        <p className="text-xl text-white">
          Copy the key {algorithm}.pub file generated in <code>~/.ssh/ </code>{" "}
          to the host system's <code> ~/.ssh/authorized_keys </code> file.
        </p>
      </form>
    </div>
  );
};

export default PKA;

