import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  address: z.string().min(2, {
    message: "Enter a valid address to SSH.",
  }),
})

export function Connect_SSH() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "localhost",
    },
  })


  async function password_auth(values: z.infer<typeof formSchema>) {
    const { address } = values;
    await invoke("connect_ssh_command", { address });
    console.log();
  }


  return (
    <div className="w-1/2 min-w-48 max-w-96">
      <Form {...form} >
        <form onSubmit={form.handleSubmit(password_auth)} className="space-y-8">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SSH Address</FormLabel>
                <FormControl>
                  <Input placeholder="address" {...field} />
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
  )
}
