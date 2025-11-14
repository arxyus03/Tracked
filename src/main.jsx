import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Linking from "./Pages/Linking.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Linking />
  </StrictMode>
);
