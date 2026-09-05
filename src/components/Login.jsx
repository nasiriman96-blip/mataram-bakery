import React, { useState } from "react";
import { Cat, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isSignup = mode === "signup";
  // Kata sandi aman: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.
  const passwordStrongEnough =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    if (isSignup && !passwordStrongEnough) {
      setError("Kata sandi minimal 8 karakter dan mengandung huruf besar, huruf kecil, serta angka.");
      return;
    }

    setLoading(true);
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setInfo("Pendaftaran berhasil. Silakan cek email untuk verifikasi, lalu masuk.");
        setMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) setError(error.message);
    }
  }

  return (
    <div className="mb-auth-screen">
      <div className="mb-auth-logo"><Cat size={26} /></div>
      <h2 className="mb-auth-title">{isSignup ? "Buat Akun" : "Masuk"}</h2>
      <p className="mb-auth-sub">
        {isSignup ? "Daftar untuk mulai mengelola Mataram Bakery." : "Masuk ke akun Mataram Bakery kamu."}
      </p>

      {error && <div className="mb-auth-error">{error}</div>}
      {info && <div className="mb-auth-success">{info}</div>}

      <form onSubmit={handleSubmit} className="mb-form">
        <label className="mb-form-label">Email</label>
        <input
          className="mb-text-input"
          style={{ marginBottom: 14 }}
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-form-label">Kata Sandi</label>
        <div className="mb-amount-input" style={{ marginBottom: 6 }}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ fontSize: 15 }}
          />
          <span style={{ cursor: "pointer" }} onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </span>
        </div>
        {isSignup && (
          <p className="mb-form-helper" style={{ marginBottom: 14 }}>
            Gunakan kombinasi huruf besar, huruf kecil, dan angka.
          </p>
        )}

        <button className="mb-submit-btn" style={{ "--accent": "var(--gold)" }} disabled={loading}>
          {loading ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
        </button>
      </form>

      <div className="mb-auth-switch">
        {isSignup ? (
          <>
            Sudah punya akun?{" "}
            <button onClick={() => { setMode("signin"); setError(""); setInfo(""); }}>Masuk</button>
          </>
        ) : (
          <>
            Belum punya akun?{" "}
            <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }}>Daftar</button>
          </>
        )}
      </div>
    </div>
  );
}
