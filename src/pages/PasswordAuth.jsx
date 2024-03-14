import { Button } from "@material-tailwind/react";
import { invoke } from "@tauri-apps/api";
import React, { useState, useEffect } from "react";

const PasswordAuth = () => {
  const [username, setUsername] = useState("");
  const [previousConnections, setPreviousConnections] = useState([]);
  const [showPreviousConnections, setShowPreviousConnections] = useState(false);

  useEffect(() => {
    // Load previous connections from file
    loadConnections();
  }, []);

  async function loadConnections() {
    try {
      const connections = await invoke("load_connections");
      setPreviousConnections(connections);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  }

  async function password_auth() {
    try {
      await invoke("connect_ssh", { username });
      await invoke("save_connection", { connection: username });

      // Reload connections after saving
      loadConnections();

      setPreviousConnections([...previousConnections, username]);
    } catch (error) {
      console.error("Error connecting or saving connection:", error);
    }
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center font-bold relative">
      {/* Previous Connections Button */}
      <div className="absolute top-4 right-4">
        <Button
          color="blue"
          ripple="light"
          onClick={() => setShowPreviousConnections(!showPreviousConnections)}
        >
          Previous Connections
        </Button>
      </div>

      {/* Previous Connections Dropdown */}
      {showPreviousConnections && (
        <div className="absolute top-16 right-4 p-4 bg-white border rounded shadow-md z-10">
          <h2 className="text-gray-800">Previous Connections:</h2>
          <ul>
            {previousConnections.map((connection, index) => (
              <li key={index}>{connection}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form */}
      <form
        className="flex flex-col gap-4 items-center"
        style={{ marginBottom: "175px" }} // Adjust the margin-top as needed
        onSubmit={(e) => {
          e.preventDefault();
          password_auth();
        }}
      >
        <input
          type="text"
          placeholder="user@ipaddress"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
        />
        <Button type="submit" color="blue" ripple="light">
          Connect
        </Button>
      </form>
    </div>
  );
};

export default PasswordAuth;
