import "./App.css";
import Auth_Modes from "@/components/Auth_Modes";
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Auth_Modes />
    </ThemeProvider>
  )

}

export default App;

