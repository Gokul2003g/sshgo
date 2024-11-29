import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

// Schema for the form validation
const formSchema = z.object({
  address: z.string().min(2, {
    message: "Enter a valid address to SSH.",
  }),
});

// Type for managing SSH session
type SSHSession = {
  id: number;
  host: string;
  connectionTime: string;
  status: "successful" | "failed";
};

export function Connect_SSH() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "localhost",
    },
  });

  const [sessions, setSessions] = useState<SSHSession[]>([]);

  // Load previous SSH connections from backend
  useEffect(() => {
    async function loadConnections() {
      try {
        const previousConnections: string[] = await invoke("load_connections_command");
        const loadedSessions: SSHSession[] = previousConnections.map((host, index) => ({
          id: index + 1,  // Generate a unique ID
          host,
          connectionTime: "N/A", // You can modify this to include actual times if available
          status: "successful", // Assuming they were successful
        }));
        setSessions(loadedSessions);
      } catch (error) {
        console.error("Error loading previous connections:", error);
      }
    }
    loadConnections();
  }, []);

  // Handle SSH connection submission
  async function password_auth(values: z.infer<typeof formSchema>) {
    const { address } = values;
    try {
      await invoke("connect_ssh_command", { address });
      console.log("Connected to:", address);

      // Save the new connection
      await invoke("save_connection_command", { connection: address });

      // Update the session list with the new connection
      setSessions((prevSessions) => [
        ...prevSessions,
        {
          id: prevSessions.length + 1,
          host: address,
          connectionTime: new Date().toLocaleTimeString(), // Add the current time
          status: "successful",
        },
      ]);
    } catch (error) {
      console.error("Error connecting to SSH:", error);
    }
  }

  // Reconnect to a previous session
  function reconnectSession(session: SSHSession) {
    invoke("connect_ssh_command", { address: session.host });
    console.log("Reconnecting to", session.host);
  }

  // Delete a previous session
  async function deleteSession(sessionId: number, host: string) {
    try {
      // Call backend to remove the connection
      await invoke("delete_connection_command", { connection: host });
      
      // Update UI to reflect the change
      setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
      console.log("Session deleted:", sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  return (
    <div className="flex">
      {/* SSH Connection Form */}
      <div className="w-full min-w-48 max-w-96 w-[20vw] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(password_auth)} className="space-y-8">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSH Address</FormLabel>
                  <FormControl>
                    <Input placeholder="address" {...field} className="w-full" />
                  </FormControl>
                  <FormDescription>
                    This is the machine you will ssh into.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Connect</Button>
          </form>
        </Form>
      </div>

      {/* Previous SSH Sessions List */}
      <div className="w-1/3 md:w-1/4 h-screen max-w-xs overflow-y-auto border-l border-gray-200 p-4 fixed right-0">
        <h2 className="text-xl font-bold mb-4">Previous Connections</h2>
        <ul className="divide-y divide-gray-200">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
            >
              <div>
                <p className="text-lg">{session.host}</p>
                <p className="text-sm text-gray-500">
                  Last used on {session.connectionTime}
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => reconnectSession(session)}
                  variant="outline"
                  size="sm"
                >
                  Reconnect
                </Button>
                <Button
                  onClick={() => deleteSession(session.id, session.host)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
