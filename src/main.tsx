import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import App from "./App";


// const Client_ID = import.meta.env.VITE_CLIENT_ID;

// console.log("Client ID:", Client_ID);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={`1025090742622-p72s4so06ptohn3ecqq97je3t4de0qov.apps.googleusercontent.com`}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
