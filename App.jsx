import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import MainApp from "./MainApp";
import { CSS } from "./styles";

export default function App() {
  const [dark, setDark] = useState(false);
  const { session, isAdmin, loading, signOut } = useAuth();

  return (
    <div className={`mb-outer ${dark ? "dark" : "light"}`}>
      <style>{CSS}</style>
      <div className={`mb-app ${dark ? "dark" : "light"}`}>
        {loading ? (
          <div className="mb-empty" style={{ height: "100%", justifyContent: "center" }}>
            <p>Memuat...</p>
          </div>
        ) : !session ? (
          <Login />
        ) : (
          <MainApp
            isAdmin={isAdmin}
            userEmail={session.user.email}
            userId={session.user.id}
            onSignOut={signOut}
            dark={dark}
            setDark={setDark}
          />
        )}
      </div>
    </div>
  );
}
