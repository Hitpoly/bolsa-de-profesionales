import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(undefined);

const AUTH_API_URL = "https://apiweb.hitpoly.com/ajax/auth.php";

// Helper para decodificar JWT (simplificado para frontend)
const jwtDecode = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.data;
  } catch (e) {
    console.error("Error decodificando JWT:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = useCallback((jwtToken) => {
    localStorage.setItem("jwt_token", jwtToken);
    setToken(jwtToken);
    const decodedUser = jwtDecode(jwtToken);
    if (decodedUser) {
      setUser(decodedUser);
      setIsAuthenticated(true);
    } else {
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("jwt_token");
    // Redirigir al inicio de la aplicación
    window.location.href = "/";
  }, []);

  // Carga inicial del token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token") || params.get("jwt");

    if (urlToken) {
      const decodedUser = jwtDecode(urlToken);
      if (decodedUser) {

        login(urlToken);
      }
      // Limpiar el token de la URL sin recargar
      params.delete("token");
      params.delete("jwt");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? "?" + newSearch : "");
      window.history.replaceState({}, "", newUrl);
    } else {
      const storedToken = localStorage.getItem("jwt_token");
      if (storedToken) {
        const decodedUser = jwtDecode(storedToken);
        if (decodedUser) {
          setUser(decodedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    }
    setLoading(false);
  }, [login, logout]);

  // --- API helpers -------------------------------------------------------
  const loginWithEmail = async (email, password) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await response.json();
    if (response.ok && data.status === "success" && data.token) {
      login(data.token);
      return data;
    }
    throw new Error(data.message || "Error al iniciar sesión");
  };

  const registerWithEmail = async (
    name,
    hitpoly_username,
    password,
    recovery_email,
    code,
    verification_hash
  ) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "register",
        name,
        hitpoly_username,
        password,
        recovery_email,
        code,
        verification_hash,
      }),
    });
    const data = await response.json();
    if (response.ok && data.status === "success" && data.token) {
      login(data.token);
      return data;
    }
    throw new Error(data.message || "Error al registrar");
  };

  const checkUsername = async (username) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_username", username }),
    });
    return await response.json();
  };

  const getSuggestions = async (firstName, lastName) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_suggestions", firstName, lastName }),
    });
    return await response.json();
  };

  const sendVerificationCode = async (recovery_email) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "send_verification", recovery_email }),
    });
    return await response.json();
  };

  const requestPasswordReset = async (identifier) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request_password_reset", identifier }),
    });
    return await response.json();
  };

  const updatePasswordWithToken = async (tokenParam, new_password) => {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_password_with_token", token: tokenParam, new_password }),
    });
    return await response.json();
  };

  // Helper para hacer peticiones autenticadas. Utiliza la API Fetch y agrega el
  // encabezado "Authorization" cuando hay un token disponible. Se emplea la
  // clase nativa `Headers` para evitar problemas de tipado con `HeadersInit`
  // (que es una unión y no permite indexación directa).
  const authFetch = useCallback(
    async (url, options = {}) => {
      // Normalizamos los encabezados recibidos en una instancia de Headers.
      const headers = new Headers(options.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Reemplazamos la propiedad headers del objeto de opciones con la
      // instancia de Headers creada.
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        loginWithEmail,
        registerWithEmail,
        checkUsername,
        getSuggestions,
        sendVerificationCode,
        requestPasswordReset,
        updatePasswordWithToken,
        authFetch,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
