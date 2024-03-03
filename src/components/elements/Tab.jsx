import { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import PasswordAuth from "../../pages/PasswordAuth";
import PKA from "../../pages/PKA";

export function UnderlineTabs() {
  const [activeTab, setActiveTab] = useState("password");

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-md w-screen border-b border-gray-500 bg-transparent text-gray-500 p-4"
        indicatorProps={{
          className:
            "bg-transparent bg-white border-b-2 border-gray-900 shadow-none rounded-md",
        }}
      >
        <Tab
          value="password"
          onClick={() => setActiveTab("password")}
          className={activeTab === "password" ? "text-gray-900 " : "text-white"}
        >
          Password Authentication
        </Tab>
        <Tab
          value="pka"
          onClick={() => setActiveTab("pka")}
          className={activeTab === "pka" ? "text-gray-900 " : "text-white"}
        >
          Public Key Authentication
        </Tab>
        <Tab
          value="certificate"
          onClick={() => setActiveTab("certificate")}
          className={
            activeTab === "certificate" ? "text-gray-900 " : "text-white"
          }
        >
          Certificate Authentication
        </Tab>
      </TabsHeader>
      <TabsBody>
        <TabPanel value="password">
          <PasswordAuth />
        </TabPanel>
        <TabPanel value="pka">
          <PKA />
        </TabPanel>
        <TabPanel value="certificate" className="text-white">
          Work in Progress
        </TabPanel>
      </TabsBody>
    </Tabs>
  );
}
