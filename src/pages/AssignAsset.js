import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import {
  Box,
  Typography,
  Autocomplete,
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

const AssignAsset = () => {
  const { encodedAssetId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);

  const tokenlocal = localStorage.getItem("token");

  const { API_CONFIG, REFRESH_CONFIG } = require('../configuration');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const encodedAssetIds = encodeURIComponent(encodedAssetId); // Encoding the assetId

        const [assetRes, usersRes] = await Promise.all([
          axios.get(`${API_CONFIG.APIURL}/assignasset/details/${encodedAssetIds}`, {
            headers: { Authorization: `Bearer ${tokenlocal}` },
          }),
          axios.get(`${API_CONFIG.APIURL}/assignasset/users`, {
            headers: { Authorization: `Bearer ${tokenlocal}` },
          }),
        ]);
 
        if (assetRes.data && typeof assetRes.data === "object") {
          setAsset(assetRes.data);
        } else {
          setError("Failed to fetch asset details.");
        }

        if (usersRes.data && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        setError("Failed to fetch asset details or users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [encodedAssetId, tokenlocal]);

  const handleAssign = async (e) => {
    e.preventDefault();
  
    if (!selectedUser) {
      setError("Please select an employee.");
      setErrorDialog(true); // Show error dialog
      return;
    }
  
    try {
      setAssigning(true);
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
  
      const payload = {
        asset_id: encodedAssetId,
        assigned_to: selectedUser.emp_id,
        requested_by: loggedInUser.emp_id,
      };
  
      const response = await axios.post(
        `${API_CONFIG.APIURL}/assignasset/assign`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response && response.data) {
        setSuccessDialog(true); // Show success dialog
        setError(""); 
        setSelectedUser(null);
      } else {
        setError("Unexpected response from server.");
        setErrorDialog(true); // Show error dialog
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to assign asset.";
      setError(errorMessage);
      setErrorDialog(true); // Show error dialog
    } finally {
      setAssigning(false);
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
            Assign Asset - {encodedAssetId}
          </Typography>

          <Typography variant="body1" mb={2}>
            <strong>Brand:</strong> {asset.brand}
          </Typography>
          <Typography variant="body1" mb={2}>
            <strong>Model:</strong> {asset.model}
          </Typography>
          <Typography variant="body1" mb={2}>
            <strong>IMEI:</strong> {asset.imei_num || "N/A"}
          </Typography>

          <form onSubmit={handleAssign}>
            <Autocomplete
              options={users}
              getOptionLabel={(user) => `${user.emp_id} - ${user.emp_name}`}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee ID - Name"
                  variant="outlined"
                  fullWidth
                  error={!!error}
                  helperText={error}
                />
              )}
              sx={{ mb: 3 }}
            />

            {selectedUser && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1">
                  <strong>Employee ID:</strong> {selectedUser.emp_id}
                </Typography>
                <Typography variant="body1">
                  <strong>Employee Name:</strong> {selectedUser.emp_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Designation:</strong> {selectedUser.designation_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Branch:</strong> {selectedUser.branchid_name}
                </Typography>
                <Typography variant="body1">
                  <strong>R O:</strong> {selectedUser.regionid_name}
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!selectedUser || assigning}
            >
              {assigning ? <CircularProgress size={24} color="inherit" /> : "Assign Asset"}
            </Button>
          </form>
        </Paper>
      </Box>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Asset assignment request was successful! An email notification has been sent to the Approver.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/dashboard")} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
<Dialog open={errorDialog} onClose={() => setErrorDialog(false)}>
  <DialogTitle>Error</DialogTitle>
  <DialogContent>
    <DialogContentText>
      {error}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
  <Button onClick={() => { setErrorDialog(false); setError(""); }} color="primary" autoFocus>
  OK
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default AssignAsset;
