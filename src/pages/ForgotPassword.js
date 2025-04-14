import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  InputAdornment,
} from "@mui/material";
import { Link } from "react-router-dom";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import Logo from "../assets/srifin_final.svg"; // Your Logo

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    console.log("Password reset email sent to:", email);
    alert("If this email is registered, a password reset link has been sent.");
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #D6E6F2, #F1F5F9)",
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
          {/* Left Section (Info Panel) */}
          <Box
            sx={{
              flex: 1,
              minWidth: "280px",
              maxWidth: "400px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              boxShadow:
                "inset 4px 4px 10px rgba(255,255,255,0.2), inset -4px -4px 10px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              borderRadius: "20px 0 0 20px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#1E3A8A",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Forgot Password?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img src={Logo} alt="Logo" width="200" height="120" />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontSize: "16px", fontWeight: "400", color: "#555" }}
            >
              Enter your email to receive a reset link.
            </Typography>
          </Box>

          {/* Right Section (Form) */}
          <Box
            sx={{
              flex: 1,
              minWidth: "280px",
              maxWidth: "400px",
              background: "#fff",
              padding: "35px",
              borderRadius: "0 20px 20px 0",
              boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.1)",
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
                color: "#1E3A8A",
              }}
            >
              Reset Password
            </Typography>

            {/* Email Input Field */}
            <TextField
              label="Enter your email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: "#4A90E2" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Send Reset Link Button */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                mb: 2,
                borderRadius: "25px",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                textTransform: "none",
                background: "linear-gradient(45deg, #4A90E2, #1E3A8A)",
                "&:hover": {
                  background: "linear-gradient(45deg, #357ABD, #162D5A)",
                },
              }}
              onClick={handleResetPassword}
            >
              Send Reset Link
            </Button>

            {/* Back to Login Link */}
            <Typography
              variant="body1"
              sx={{ fontSize: "14px", fontWeight: "500" }}
            >
              Remembered your password?{" "}
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: "#4A90E2",
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
