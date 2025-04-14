import React, { useState, useEffect } from "react";
import Navbar from "../Navbar"; // Ensure correct path
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Button, TextField, Checkbox, Container, Typography, CircularProgress,
  Snackbar, Alert, TablePagination, Paper, IconButton, Tooltip, Box, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlined from "@mui/icons-material/InfoOutlined"; // Importing the InfoOutlined icon

const FreePoolApproval = () => {
  const [assetData, setAssetData] = useState([]);
  const [filteredAssetData, setFilteredAssetData] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [remarkErrors, setRemarkErrors] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false); // for the confirmation modal/dialog
  const [confirmAction, setConfirmAction] = useState(null); // stores the action to confirm (approve/reject)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssignedAssetData();
  }, []);

  const fetchAssignedAssetData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/freeapproval/free-assets");
      if (Array.isArray(res.data)) {
        setAssetData(res.data);
        setFilteredAssetData(res.data);
      } else {
        throw new Error("Fetched data is not an array.");
      }
    } catch (err) {
      setError("");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredData = assetData.filter(asset =>
      String(asset.asset_id).toLowerCase().includes(query) ||
      asset?.asset?.brand.toLowerCase().includes(query) ||
      asset?.asset?.model.toLowerCase().includes(query) ||
      asset?.system?.emp_id.toLowerCase().includes(query) ||
      asset?.system?.emp_name.toLowerCase().includes(query)
    );
    setFilteredAssetData(filteredData);
  };

  const handleCheckboxChange = (requestNum) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [requestNum]: !prev[requestNum],
    }));

    if (selectedAssets[requestNum]) {
      setRemarks((prev) => {
        const newRemarks = { ...prev };
        delete newRemarks[requestNum];
        return newRemarks;
      });
    }
  };

  const handleRemarkChange = (requestNum, value) => {
    setRemarks((prev) => ({ ...prev, [requestNum]: value }));
    if (remarkErrors[requestNum]) {
      setRemarkErrors((prev) => ({ ...prev, [requestNum]: "" })); // Clear error
    }
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    
    if (checked) {
      // Select all assets
      const newSelection = {};
      filteredAssetData.forEach((asset) => {
        newSelection[asset.request_num] = true;
      });
      setSelectedAssets(newSelection);
    } else {
      // Deselect all assets
      setSelectedAssets({});
      setRemarks({}); // Clear remarks when deselecting all
    }
  };
  
  
  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      const selectedAssetIds = Object.keys(selectedAssets).filter(id => selectedAssets[id]);
      if (selectedAssetIds.length === 0) return;
  
      const newRemarkErrors = validateRemarks(selectedAssetIds);
      if (Object.keys(newRemarkErrors).length > 0) {
        setRemarkErrors(newRemarkErrors);
        setActionLoading(false);
        return;
      }
  
      await updateAssetStatus(selectedAssetIds);
      setSelectedAssets({});
      setRemarks({});
      setRemarkErrors({});
      setConfirmationOpen(false);
      setSnackbar({
        open: true,
        message: `${confirmAction === "approved" ? "Approved" : "Rejected"} successfully!`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error processing request.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  const validateRemarks = (selectedAssetIds) => {
    let newRemarkErrors = {};
    selectedAssetIds.forEach(id => {
      if (confirmAction === "rejected" && !remarks[id]?.trim()) {
        newRemarkErrors[id] = "Remarks are required for rejection.";
      }
    });
    return newRemarkErrors;
  };
  
  const updateAssetStatus = async (selectedAssetIds) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const extractedRemark = Object.values(remarks)[0]; 
      const apiUrl = confirmAction === "approved" ? "http://localhost:5000/api/freeapproval/approve" : "http://localhost:5000/api/freeapproval/reject";
      await axios.post(apiUrl, {
        requestNums: selectedAssetIds,
        approved_by: loggedInUser.emp_id,
        remarks: confirmAction === "rejected" ? extractedRemark : "",
      });
      fetchAssignedAssetData(); // Refresh the asset list after action
      // Optionally, add success feedback (Snackbar)
    } catch (error) {
      console.error("Error during API call:", error);
      setError("Failed to update asset status.");
    }
  };
  
  const handleAction = (action) => {
    setConfirmAction(action);
    setConfirmationOpen(true);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mb: 0, backgroundColor: "#F9FAFB", borderRadius: 2, p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2E3B55", fontWeight: "bold", mb: 4 }}>
          Free Pool Asset Requests
        </Typography>

        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search assets..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: { xs: "100%", sm: "40%" }, backgroundColor: "white", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#2E3B55" }} />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh Asset List">
            <IconButton onClick={fetchAssignedAssetData} sx={{ color: "#607D8B", mt: { xs: 1, sm: 0 } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Snackbar open={true} autoHideDuration={6000}><Alert severity="error">{error}</Alert></Snackbar>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : filteredAssetData.length === 0 ? (
          <Typography variant="h6" align="center" color="textSecondary">
            No assigned assets found.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#a2b0cc", color: "white" }}>
                  <TableCell><Checkbox onChange={handleSelectAllChange} /></TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Request NO.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Asset ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Asset Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Asset Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Serial Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Assignment Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Remark</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssetData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((asset) => (
                    <TableRow key={asset.assignment_id} hover>
                      <TableCell>
                        <Checkbox
                          checked={!!selectedAssets[asset.request_num]}
                          onChange={() => handleCheckboxChange(asset.request_num)}
                        />
                      </TableCell>
                      <TableCell>{asset.request_num}</TableCell>
                      <TableCell>{asset.asset_id}</TableCell>
                      <TableCell>{asset.asset_type}</TableCell>
                      <TableCell>{asset.asset_name}</TableCell>
                      <TableCell>{asset.imei_num}</TableCell>
                      <TableCell>
                         {`${asset?.system?.emp_id || "N/A"} - ${asset?.system?.emp_name || "N/A"}`}
                         <Tooltip
                         title={
                           <Box sx={{ textAlign: "left" }}>
                             <Typography variant="body2">Designation: {asset?.system?.designation_name || "N/A"}</Typography>
                             <Typography variant="body2">Department: {asset?.system?.department_name || "N/A"}</Typography>
                             <Typography variant="body2">Branch: {asset?.system?.branchid_name || "N/A"}</Typography>
                             <Typography variant="body2">Area: {asset?.system?.areaid_name || "N/A"}</Typography>
                             <Typography variant="body2">Region: {asset?.system?.regionid_name || "N/A"}</Typography>
                             <Typography variant="body2">Cluster: {asset?.system?.clusterid_name || "N/A"}</Typography>
                             <Typography variant="body2">State: {asset?.system?.state || "N/A"}</Typography>
                           </Box>
                         }
                         arrow
                         >
                          <IconButton size="small" sx={{ color: "#1976D2", ml: 1 }}>
                             <InfoOutlined fontSize="small" />
                         </IconButton>
                         </Tooltip>
                       </TableCell>
                      <TableCell>{asset.assignment_status}</TableCell>
                      <TableCell>
                        {/* <TextField
                          size="small"
                          placeholder="Enter remark..."
                          value={remarks[asset.asset_id] || ""}
                          onChange={(e) => {
                            handleRemarkChange(asset.asset_id, e.target.value);
                            setRemarkErrors((prev) => ({ ...prev, [asset.asset_id]: "" }));
                          }}
                          disabled={!selectedAssets[asset.asset_id]}
                          fullWidth
                          error={!!remarkErrors[asset.asset_id]}
                          helperText={remarkErrors[asset.asset_id]}
                        /> */}

                        <TextField
                          size="small"
                          placeholder="Enter remark..."
                          value={remarks[asset.request_num] || ""}  // Ensure request_num is used
                          onChange={(e) => {
                            handleRemarkChange(asset.request_num, e.target.value);
                            setRemarkErrors((prev) => ({ ...prev, [asset.request_num]: "" }));
                          }}
                          disabled={!selectedAssets[asset.request_num]}
                          fullWidth
                          error={!!remarkErrors[asset.request_num]}
                          helperText={remarkErrors[asset.request_num]}
                        />

                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mt={2}>
          <TablePagination
            component="div"
            count={filteredAssetData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: "#1976D2" }} 
              onClick={() => handleAction("approved")}
              disabled={Object.values(selectedAssets).every(value => !value)}>
              Approve
            </Button>

            <Button 
              variant="contained" 
              sx={{ backgroundColor: "#D32F2F" }} 
              onClick={() => handleAction("rejected")}
              disabled={Object.values(selectedAssets).every(value => !value)}>
              Reject
            </Button>
          </Box>
        </Box>

        {/* Confirmation Dialog */}
        <Box>
          <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to {confirmAction} the selected assets?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmationOpen(false)} color="primary">Cancel</Button>
              <Button onClick={handleConfirmAction} color="primary" disabled={actionLoading}>
                {actionLoading ? <CircularProgress size={24} /> : "Confirm"}
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
        </Box>
      </Container>
    </>
  );
};

export default FreePoolApproval;