import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { invoke } from "@tauri-apps/api";

const Certificate_Authentication = () => {
  const [certificate, setCertificate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    public_key: z.string().min(1, "Public key is required"),
    is_host: z.boolean().default(false),
    identity: z.string(),
    provider: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      public_key: "",
      is_host: false,
      identity: "user1@example.com",
      provider: "google",
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (isSubmitting) return; // Prevent multiple submissions
      setIsSubmitting(true);

      try {
        const cert = await invoke<string>("generate_certificate_command", {
          publicKey: values.public_key,
          isHost: values.is_host,
          email: values.identity,
          provider: values.provider,
        });
        setCertificate(cert);
        console.log("Certificate generated:", cert);
      } catch (e) {
        console.error("Error generating certificate:", e);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const downloadKey = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to download the file");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
    }
  };

  const downloadCertificate = () => {
    if (!certificate || certificate === "Invalid Public Key") {
      console.error("No certificate available to download");
      return;
    }

    const blob = new Blob([certificate], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ssh-cert.pub");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen">
      <nav className="px-8 py-6 flex justify-between items-center">
        <img
          src="/sshgo_logo.jpg"
          alt="sshgo_logo"
          width={50}
          height={50}
          className="rounded-full"
        />
      </nav>
      <Separator />
      <div className="flex flex-col items-center py-12 ">
        <div className="w-3/4">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission behavior
                form.handleSubmit(onSubmit)();
              }}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="public_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-3xl">
                      Upload Public Key Here
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Upload your public key to generate certificate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Are you Host?</FormLabel>
                  <FormDescription>
                    Toggle on to issue host certificate and off to issue user
                    certificate
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={form.watch("is_host")}
                    onCheckedChange={(value) =>
                      form.setValue("is_host", value)
                    }
                  />
                </FormControl>
              </FormItem>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Generating..." : "Generate Certificate"}
              </Button>
            </form>
          </Form>
        </div>
        <Separator className="my-16 w-4/5 bg-black" />
        <div className="w-3/4">
          <Label className="text-3xl">Get Certificate Here</Label>
          <Textarea
            className="my-8 text-sm h-36"
            readOnly
            value={certificate}
            placeholder="Generated certificate will appear here"
          />
          <Button onClick={downloadCertificate}>Download Certificate</Button>
        </div>
        <Separator className="my-16 w-4/5 bg-black" />
        <div className="w-3/4 flex justify-around">
          <Button
            onClick={() =>
              downloadKey("/public/user-sign-key.pub", "user-sign-key.pub")
            }
          >
            Download User Signing Public Key (Hosts Download this)
          </Button>
          <Button
            onClick={() =>
              downloadKey("/public/host-sign-key.pub", "host-sign-key.pub")
            }
          >
            Download Host Signing Public Key (Users Download this)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Certificate_Authentication;

