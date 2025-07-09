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
import InfoOutlined from "@mui/icons-material/InfoOutlined"; 
import { useCallback } from "react";

const MaintenanceApproval = () => {
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
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [actionLoading, setActionLoading] = useState(false);

  const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

  

  useEffect(() => {
    setFilteredAssetData(assetData);
  }, [assetData]);

  const fetchAssignedAssetData = useCallback(async () => { 
    setLoading(true);
  
    const CACHE_KEY = "assignedAssetDataMetadata";
  
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { timestamp, cacheDuration, data } = JSON.parse(cached);
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);
  
        if (isValid && Array.isArray(data)) {
          setAssetData(data);
          setFilteredAssetData(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse assigned asset cache:", err);
      }
    }
  
    try {
      const res = await axios.get(`${API_CONFIG.APIURL}/underapproval/free-under-assets`);
      console.log("res",res);
      if (Array.isArray(res.data)) {
        const metadata = {
          timestamp: Date.now(),
          cacheDuration: REFRESH_CONFIG.DROPDOWN_REFRESH_INTERVAL,
          data: res.data,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(metadata));
  
        setAssetData(res.data);
        setFilteredAssetData(res.data);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err) {
      console.error("Error fetching assigned assets:", err);
      setError("");
    } finally {
      setLoading(false);
    }
  }, [API_CONFIG.APIURL, REFRESH_CONFIG.DROPDOWN_REFRESH_INTERVAL]);
  
  useEffect(() => {
    fetchAssignedAssetData();
  }, [fetchAssignedAssetData]);  

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = assetData.filter((asset) =>
      String(asset.asset_id).toLowerCase().includes(query) ||
      asset?.asset?.brand.toLowerCase().includes(query) ||
      asset?.asset?.model.toLowerCase().includes(query) ||
      asset?.system?.emp_id.toLowerCase().includes(query) ||
      asset?.system?.emp_name.toLowerCase().includes(query)
    );
    setFilteredAssetData(filtered);
  };

  const handleCheckboxChange = (requestNum) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [requestNum]: !prev[requestNum],
    }));
    if (selectedAssets[requestNum]) {
      const updatedRemarks = { ...remarks };
      delete updatedRemarks[requestNum];
      setRemarks(updatedRemarks);
    }
  };  

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    const currentPageItems = filteredAssetData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    const updatedSelections = { ...selectedAssets };
  
    currentPageItems.forEach(item => {
      updatedSelections[item.request_num] = isChecked;
      if (!isChecked) delete remarks[item.request_num];
    });
  
    if (!isChecked) {
      setRemarks({});
    }
  
    setSelectedAssets(updatedSelections);
  };
  
  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
    if (remarkErrors[id]) {
      setRemarkErrors(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const openConfirmationDialog = (actionType) => {
    setConfirmAction(actionType);
    setConfirmationOpen(true);
  };
  
  const handleConfirmAction = async () => {
    setActionLoading(true);
    const selectedIds = Object.keys(selectedAssets).filter(id => selectedAssets[id]);

    if (confirmAction === "reject") {
      const missingRemarks = selectedIds.filter(id => !remarks[id]?.trim());
      if (missingRemarks.length > 0) {
        const errors = {};
        missingRemarks.forEach(id => {
          errors[id] = "Remark is required for rejection.";
        });
        setRemarkErrors(errors);
        setSnackbar({
          open: true,
          message: "Remarks are mandatory for rejection.",
          severity: "warning",
        });
        setActionLoading(false);
        return;
      }
    }

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      console.log("action",confirmAction)
      const extractedRemark = Object.values(remarks)[0]; // Get the first value
      console.log("action",extractedRemark)

      await axios.post(`${API_CONFIG.APIURL}/underapproval/action`, {
        requestNums: selectedIds,
        action: confirmAction,
        approved_by: loggedInUser.emp_id,
        remarks: confirmAction === "rejected" ? extractedRemark : "",
      });

      setSnackbar({
        open: true,
        message: `Assets ${confirmAction === "approved" ? "accepeted" : "rejected"} successfully!`,
        severity: "success",
      });

      fetchAssignedAssetData();
      setSelectedAssets([]);
      setRemarks({});
      setRemarkErrors({});
      setConfirmationOpen(false);
    } catch (error) {
      console.error("Approval error:", error);
      setSnackbar({
        open: true,
        message: "Failed to update asset approval status.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allSelected = filteredAssetData
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .every((asset) => selectedAssets[asset.request_num]);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mb: 0, backgroundColor: "#F9FAFB", borderRadius: 2, p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2E3B55", fontWeight: "bold", mb: 4 }}>
          Under Maintenanace Asset Requests
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
                <TableCell >
                    <Checkbox checked={allSelected} onChange={handleSelectAllChange} />
                  </TableCell>
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
                         {`${asset.assigned_to || "N/A"}`}
                       </TableCell>
                      <TableCell>{asset.assignment_status}</TableCell>
                      <TableCell>
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
              sx={{ backgroundColor: "#1976D2", width: { xs: "100%", sm: "auto" } }} 
              onClick={() => openConfirmationDialog("approved")}
              disabled={Object.keys(selectedAssets).length === 0}>
              Approve
            </Button>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: "#D32F2F", width: { xs: "100%", sm: "auto" } }} 
              onClick={() => openConfirmationDialog("rejected")}
              disabled={Object.keys(selectedAssets).length === 0}>
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

export default MaintenanceApproval;
