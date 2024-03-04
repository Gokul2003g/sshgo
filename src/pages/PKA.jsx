import { Button, Option } from "@material-tailwind/react";
import { Select } from "@material-tailwind/react";
import { invoke } from "@tauri-apps/api";
import React, { useState } from "react";

const PKA = () => {
  const [algorithm, setAlgorithm] = useState("rsa");
  const [password, setPassword] = useState("");

  async function generate_keys() {
    await invoke("generate_keys", { algorithm, password });
  }

  return (
    <div className="flex flex-row gap-4 items-center justify-center font-bold">
      <form
        className="flex flex-col gap-4"
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
          value={algorithm}
          onChange={() => setAlgorithm(value)}
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
          placeholder="Password for key"
          onChange={(e) => setPassword(e.currentTarget.value)}
          className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
        />
        <Button type="submit" color="blue" ripple="light">
          Generate
        </Button>
        {password}
      </form>
    </div>
  );
};

export default PKA;
