import { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

export function UnderlineTabs() {
  const [activeTab, setActiveTab] = useState("password");

  const data = [
    {
      label: "Password Authentication",
      value: "password",
      desc: `Work in Progress`,
    },
    {
      label: "Public Key Authentication",
      value: "pka",
      desc: `Work in Progress`,
    },
    {
      label: "Certificate Authentication",
      value: "certificate",
      desc: `Work in Progress`,
    },
  ];

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-md w-screen border-b border-gray-500 bg-transparent text-gray-500 p-4"
        indicatorProps={{
          className:
            "bg-transparent bg-white border-b-2 border-gray-900 shadow-none rounded-md",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={activeTab === value ? "text-gray-900 " : "text-white"}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}


