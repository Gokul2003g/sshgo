import { Button } from "@material-tailwind/react";
import { invoke } from "@tauri-apps/api";
import React, { useState } from "react";

const PasswordAuth = () => {
  const [username, setUsername] = useState("");

  async function password_auth() {
    await invoke("connect_ssh", { username });
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center font-bold">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          password_auth();
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
  );
};

export default PasswordAuth;
