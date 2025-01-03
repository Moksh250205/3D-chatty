import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirectWrapper = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home"); // Redirect to the home route if token exists
    }
  }, [navigate]);

  return <>{children}</>; // Render children if no token exists
};

export default AuthRedirectWrapper;
