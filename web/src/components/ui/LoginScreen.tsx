import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./LoginScreen.css";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, register, loading, error } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    cpf: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;
    if (mode === "login") {
      console.log("Attempting login...");
      success = await login(formData.email, formData.password);
      console.log("Login success:", success);
    } else {
      success = await register(
        formData.username,
        formData.email,
        formData.cpf,
        formData.password
      );
    }

    if (success) {
      console.log("Authentication successful, reloading page...");
      // Force reload to ensure proper app initialization with authenticated state
      window.location.reload();
    }

    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
    return formatted;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedCPF = formatCPF(value);
    setFormData((prev) => ({
      ...prev,
      cpf: formattedCPF,
    }));
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setFormData({
      email: "",
      password: "",
      username: "",
      cpf: "",
    });
  };

  return (
    <div className="login-screen">
      <div className="login-background"></div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              {/* <img src={logoSvg} alt="Renovare Logo" className="logo-icon" width="150" height="150" style={{ margin: '-50px 0', display: 'block' }} /> */}
              ♻️
              <h2 style={{ color: "green" }}>Renovare</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-tabs">
              <button
                type="button"
                className={`tab-button ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`tab-button ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
              >
                Cadastrar
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-fields">
              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="username">Nome de usuário</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome de usuário"
                    required
                    autoComplete="username"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu e-mail"
                  required
                  autoComplete="email"
                />
              </div>

              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Cadastrar"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {mode === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button
                type="button"
                className="link-button"
                onClick={toggleMode}
              >
                {mode === "login" ? "Cadastre-se aqui" : "Entre aqui"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
