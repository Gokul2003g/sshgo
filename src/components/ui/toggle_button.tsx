import * as React from "react"
import { Button } from "@/components/button" // Assuming Button component is exported from your button file

interface ToggleButtonProps {
  onToggle: (role: string) => void;
  initialRole?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ onToggle, initialRole = "user" }) => {
  const [role, setRole] = React.useState(initialRole);

  const handleToggle = () => {
    const newRole = role === "user" ? "host" : "user";
    setRole(newRole);
    onToggle(newRole);
  };

  return (
    <div className="flex items-center">
      <Button variant="outline" size="default" onClick={handleToggle}>
        {role === "user" ? "Switch to Host" : "Switch to User"}
      </Button>
      <span className="ml-4 text-sm font-medium">
        Current Role: {role === "user" ? "User" : "Host"}
      </span>
    </div>
  );
};

export default ToggleButton;

