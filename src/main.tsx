import "nprogress/nprogress.css";
import { createRoot } from "react-dom/client";
import "./assets/style/index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.ts";

import { ThemeProvider } from "./components/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <RouterProvider router={router} />
  </ThemeProvider>
);
