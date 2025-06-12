import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Container,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import Logo from "../assets/srifin_final.svg";

const Login = () => {
  const [emp_id, setemp_id] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { API_CONFIG, REFRESH_CONFIG } = require('../configuration');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_CONFIG.APIURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emp_id, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        // Storing token and user data
        localStorage.setItem("token", data.token); // ✅ Store token
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        localStorage.setItem("allowedModules", JSON.stringify(data.allowedModules || [])); // ✅ Storing allowed modules
        localStorage.setItem("statesAssigned", JSON.stringify(data.statesAssigned || [])); // ✅ Store state_assigned in localStorage

        setMessage("Login successful ✅");

        // Redirect based on modules or roles (optional)
        if (data.allowedModules.includes("Admin")) {
          navigate("/admin-dashboard");
        } else {
          navigate("/DashBoard");
        }
      } else {
        // Error handling with detailed message from the backend
        setMessage(data.message || "Login failed ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Error connecting to the server ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #DCE6F1, #B0BEC5)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {/* Left Section (Welcome Box) */}
          <Box
            sx={{
              flex: 1,
              minWidth: "280px",
              maxWidth: "380px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(15px)",
              boxShadow: "inset 4px 4px 10px rgba(255,255,255,0.2), inset -4px -4px 10px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              borderRadius: "20px 0 0 20px",
              textAlign: "center",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img src={Logo} alt="Logo" width="180" height="110" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1c5789" }}>
              ASSET MANAGEMENT
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "12px", mb: 2, maxWidth: "300px", color: "#555" }}>
              Efficiently track and manage your valuable assets with ease!
            </Typography>
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "400", color: "#444" }}>
              Log in to access your account
            </Typography>
          </Box>

          {/* Right Section (Login Form) */}
          <form onSubmit={handleLogin}>
            <Box
              sx={{
                flex: 1,
                minWidth: "280px",
                maxWidth: "380px",
                background: "#FAFAFA",
                padding: "35px",
                borderRadius: "0 20px 20px 0",
                boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.15)",
                textAlign: "center",
                "&:hover": {
                  boxShadow: "10px 10px 25px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  fontSize: "24px",
                  textTransform: "uppercase",
                  color: "#2A5F9E",
                }}
              >
                LOGIN
              </Typography>

              {/* emp_id Field */}
              <TextField
                label="Employee Id"
                variant="outlined"
                fullWidth
                value={emp_id}
                onChange={(e) => setemp_id(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon sx={{ color: "#3A78C9" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Password Field with Show/Hide Option */}
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#3A78C9" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff sx={{ color: "#3A78C9" }} /> : <Visibility sx={{ color: "#3A78C9" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Remember Me & Forgot Password */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />}
                  label="Remember me"
                />
                <Link to="/ForgotPassword" style={{ color: "#1c5789", fontSize: "12px" }}>
                  <MailOutlineIcon sx={{ mr: 1, fontSize: "20px" }} /> Forgot Password?
                </Link>
              </Box>

              {/* Login Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                // onClick={handleLogin}
                type="submit"
                disabled={loading}
                sx={{
                  mb: 2,
                  textTransform: "none",
                  backgroundColor: "#1c5789",
                  "&:hover": {
                    backgroundColor: "#154A6A",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>

              {/* Message */}
              {message && (
                <Typography variant="body2" sx={{ color: "red", fontSize: "14px" }}>
                  {message}
                </Typography>
              )}
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;