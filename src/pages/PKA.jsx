import { Button, Option } from "@material-tailwind/react";
import { Select } from "@material-tailwind/react";
import React from "react";

const PKA = () => {
  return (
    <div className="flex flex-row gap-4 items-center justify-center font-bold">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          password_auth();
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
          placeholder="Folder to save keys."
          onChange={(e) => setUsername(e.currentTarget.value)}
          className="p-4 bg-transparent border-2 rounded-lg border-gray-500 text-white focus:border-gray-900"
        />
        <Button type="submit" color="blue" ripple="light">
          Generate
        </Button>
      </form>
    </div>
  );
};

export default PKA;
