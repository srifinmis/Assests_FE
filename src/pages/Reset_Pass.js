import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      setError("Invalid or missing token.");
    }
    setToken(t);
  }, [searchParams]);

  const { API_CONFIG, REFRESH_CONFIG } = require('../configuration');

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_CONFIG.APIURL}/reset/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        navigate("/"); // redirect to login
      } else {
        setError(result.message || "Reset failed. Try again.");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #DCEEFF, #f6f9fc)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: "#fff",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, color: "#1E3A8A" }}>
            Set New Password
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            sx={{ mb: 3 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              padding: "12px",
              borderRadius: "25px",
              background: "linear-gradient(to right, #4A90E2, #1E3A8A)",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Reset Password
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPassword;
