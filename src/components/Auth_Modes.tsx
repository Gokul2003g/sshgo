import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Certificate_Authentication } from "@/pages/Certificate_Authentication";
import { Connect_SSH } from "@/pages/Connect_SSH";


function Auth_Modes() {

  return (
    <Tabs defaultValue="certificate_auth">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manage_keys">Manage Keys</TabsTrigger>
        <TabsTrigger value="connect_ssh">Connect SSH</TabsTrigger>
        <TabsTrigger value="certificate_auth">Certificate Authentication</TabsTrigger>
      </TabsList>
      <TabsContent value="manage_keys">
        Manage Keys
      </TabsContent>
      <TabsContent value="connect_ssh" className="flex justify-center items-center">
        <Connect_SSH />
      </TabsContent>
      <TabsContent value="certificate_auth">
        <Certificate_Authentication />
      </TabsContent>
    </Tabs>
  )
}

export default Auth_Modes;
