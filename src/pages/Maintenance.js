import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const MaintenanceAsset = () => {
  const { encodedAssetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [openPopup, setOpenPopup] = useState(false); // ✅ State for popup

  const { API_CONFIG, REFRESH_CONFIG } = require('../configuration');

  const [assignedTo, setAssignedTo] = useState(
    asset?.emp_name && asset?.emp_id ? `${asset.emp_name} - ${asset.emp_id}` : "N/A"
  );

  useEffect(() => {
    const encodedAssetIds = encodeURIComponent(encodedAssetId);
    const cacheKey = `assetDetailsMetadata_${encodedAssetIds}`;

    const fetchAssetDetails = () => {
      axios
        .get(`${API_CONFIG.APIURL}/assignasset/details/${encodedAssetIds}`)
        .then((response) => {
          const metadata = {
            timestamp: Date.now(),
            cacheDuration: REFRESH_CONFIG.DROPDOWN_REFRESH_INTERVAL, // or define a shorter duration if needed
            data: response.data,
          };
          localStorage.setItem(cacheKey, JSON.stringify(metadata));
          setAsset(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch asset details.");
          setLoading(false);
        });
    };

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, cacheDuration, data } = JSON.parse(cached);
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);
        if (isValid && data) {
          setAsset(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse asset details cache:", err);
      }
    }

    fetchAssetDetails();
  }, [encodedAssetId, API_CONFIG.APIURL, REFRESH_CONFIG.DROPDOWN_REFRESH_INTERVAL]);


  const handleMoveToMaintenance = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError("");

    if (!asset) {
      setError("Asset details are not available.");
      setIsProcessing(false);
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    const requestedBy = loggedInUser.emp_id;

    if (!requestedBy) {
      setError("User not logged in. Please log in and try again.");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post(`${API_CONFIG.APIURL}/maintenanceasset/maintenance`, {
        asset_id: encodedAssetId,
        requested_by: requestedBy,
        assigned_to: assignedTo
      });

      if (response.status === 200 && response.data.message) {
        setOpenPopup(true); // ✅ Open the popup

        // ✅ Update UI immediately
        setAsset((prevAsset) => ({
          ...prevAsset,
          assignment_status: "Under Maintenance",
          emp_name: "N/A",
          emp_id: "",
        }));
      } else {
        throw new Error(response.data.error || "Unexpected error");
      }
    } catch (err) {
      console.error("Error moving asset:", err);
      setError(`Failed to move asset: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    navigate("/DashBoard"); // ✅ Navigate after closing popup
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
            Move Asset to Under Maintenance
          </Typography>

          <TextField fullWidth label="Asset ID" value={asset?.asset_id || ""} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="Brand" value={asset?.brand || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="Model" value={asset?.model || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />
          <TextField fullWidth label="IMEI Number" value={asset?.imei_num || "N/A"} variant="outlined" disabled sx={{ mb: 2 }} />
          {/* <TextField
            fullWidth
            label="Assigned To"
            value={asset?.emp_name && asset?.emp_id ? `${asset.emp_name} - ${asset.emp_id}` : "N/A"}
            variant="outlined"
            disabled
            sx={{ mb: 2 }}
          /> */}
          <TextField
            fullWidth
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleMoveToMaintenance}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Move to Maintenance"}
          </Button>
        </Paper>
      </Box>

      {/* ✅ Success Message Popup */}
      <Dialog open={openPopup} onClose={handleClosePopup}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Asset has been successfully moved to <strong>Under Maintenance</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaintenanceAsset;
