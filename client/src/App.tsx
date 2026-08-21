import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppShell from "./components/AppShell";
import Ajustes from "./pages/Ajustes";
import Backup from "./pages/Backup";
import Cidadaos from "./pages/Cidadaos";
import Home from "./pages/Home";
import Importar from "./pages/Importar";
import Indicadores from "./pages/Indicadores";
import Rotina from "./pages/Rotina";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/indicadores"} component={Indicadores} />
        <Route path={"/cidadaos"} component={Cidadaos} />
        <Route path={"/rotina"} component={Rotina} />
        <Route path={"/importar"} component={Importar} />
        <Route path={"/backup"} component={Backup} />
        <Route path={"/ajustes"} component={Ajustes} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
