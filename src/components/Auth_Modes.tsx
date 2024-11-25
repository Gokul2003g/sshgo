import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Certificate_Authentication from "@/pages/Certificate_Authentication";  // Correct import
import { Connect_SSH } from "@/pages/Connect_SSH";
import ManageKeys from "@/pages/manage_keys";

function Auth_Modes() {
  return (
    <Tabs defaultValue="certificate_auth">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manage_keys">Manage Keys</TabsTrigger>
        <TabsTrigger value="connect_ssh">Connect SSH</TabsTrigger>
        <TabsTrigger value="certificate_auth">Certificate Authentication</TabsTrigger>
      </TabsList>
      <TabsContent value="manage_keys">
        <ManageKeys />
      </TabsContent>
      <TabsContent value="connect_ssh">
        <Connect_SSH />
      </TabsContent>
      <TabsContent value="certificate_auth">
        <Certificate_Authentication />
      </TabsContent>
    </Tabs>
  );
}

export default Auth_Modes;

