import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Ensure correct path
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";

const RemoveAsset = () => {
  const { assetId } = useParams(); 
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/assignasset/details/${assetId}`)
      .then((response) => {
        setAsset(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch asset details.");
        setLoading(false);
      });
  }, [assetId]);

  const handleMoveToFreePool = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(""); 

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user")); // Retrieve logged-in user details
      if (!loggedInUser?.emp_id) {
        throw new Error("User session expired. Please log in again.");
      }

      const response = await axios.post("http://localhost:5000/api/freepoolasset/freepool", {
        asset_id: assetId,
        requested_by: loggedInUser.emp_id,
      });

      if (response.status === 200) {
        alert("Asset moved to Free Pool successfully!");
        setTimeout(() => navigate("/DashBoard"), 1500);
      } else {
        throw new Error(response.data.message || "Unexpected error");
      }
    } catch (err) {
      console.error("Error moving asset:", err);
      setError(`Failed to move asset: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center" mt={3}>
        {error}
      </Typography>
    );

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 500, margin: "auto", mt: 5 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={4}>
          <Typography variant="h5" fontWeight="bold" mb={2} color="#1976D2">
            Move Asset to Free Pool
          </Typography>

          <TextField fullWidth label="Asset ID" value={asset?.asset_id || ""} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="Brand" value={asset?.brand || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="Model" value={asset?.model || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="IMEI Number" value={asset?.imei_num || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />

          <TextField
            fullWidth
            label="Assigned To"
            value={asset?.emp_name && asset?.emp_id ? `${asset.emp_name} - ${asset.emp_id}` : "N/A"}
            variant="outlined"
            disabled
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleMoveToFreePool}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Move to Free Pool"}
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default RemoveAsset;
