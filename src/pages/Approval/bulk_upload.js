import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Button, TextField, Checkbox, Container, Typography, CircularProgress,
  Snackbar, Alert, TablePagination, Paper, IconButton, Tooltip, Box, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Close as CloseIcon } from "@mui/icons-material";

const BulkUploadPage = () => {
  const [bulkUploads, setBulkUploads] = useState([]);
  const [filteredBulk, setFilteredBulk] = useState([]);
  const [selectedBulk, setSelectedBulk] = useState([]);
  const [bulkRemarks, setBulkRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openDialog, setOpenDialog] = useState(false);
  const [detailedBulkId, setDetailedBulkId] = useState(null);
  const [detailedBulkData, setDetailedBulkData] = useState(null);

  useEffect(() => {
    fetchBulkUploads();
  }, []);

  const fetchBulkUploads = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/bulkupload/uploads");
      setBulkUploads(Array.isArray(res.data) ? res.data : []);
      setFilteredBulk(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to fetch bulk uploads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkDetails = async (bulkId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bulkupload/uploads/${bulkId}`);
      console.log("assignments",res);
      setDetailedBulkData(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to fetch bulk details.", severity: "error" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = bulkUploads.filter(bulk =>
      String(bulk.bulk_id).toLowerCase().includes(query) ||
      String(bulk.requested_by).toLowerCase().includes(query)
    );
    setFilteredBulk(filtered);
  };

  const handleBulkSelect = (id) => {
    setSelectedBulk(prev =>
      prev.includes(id) ? prev.filter(bulkID => bulkID !== id) : [...prev, id]
    );
  };

  const handleSelectAllChange = (e) => {
    const currentPageBulks = filteredBulk.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const newSelection = e.target.checked
      ? [...new Set([...selectedBulk, ...currentPageBulks.map(bulk => bulk.bulk_id)])]
      : selectedBulk.filter(id => !currentPageBulks.some(bulk => bulk.bulk_id === id));
    setSelectedBulk(newSelection);
  };

  const handleRemarkChange = (id, value) => {
    setBulkRemarks(prev => ({ ...prev, [id]: value }));
  };

  // const handlePOAction = async (action) => {
  //   const requiresRemark = action === "reject";
  //   const hasEmptyRemarks = selectedBulk.some(id => !bulkRemarks[id]?.trim());

  //   if (requiresRemark && hasEmptyRemarks) {
  //     setSnackbar({
  //       open: true,
  //       message: "Remarks are mandatory for rejection.",
  //       severity: "warning",
  //     });
  //     return;
  //   }

  //   setActionLoading(true);
  //   try {
  //     const loggedInUser = JSON.parse(localStorage.getItem("user"));
  //     const apiUrl = "http://localhost:5000/api/bulkupload/action";

  //     const remarksList = selectedBulk.map((id) => ({
  //       assignment_id: id,
  //       remarks: bulkRemarks[id] || "",
  //     }));

  //     await axios.post(apiUrl, {
  //       assignmentIds: selectedBulk,
  //       action,
  //       approved_by: loggedInUser.emp_id,
  //       remarksList,
  //       remark: remarksList[0]?.remarks || "",
  //     });

  //     setSnackbar({
  //       open: true,
  //       message: `POs ${action === "approve" ? "approved" : "rejected"} successfully!`,
  //       severity: "success",
  //     });

  //     fetchBulkUploads();
  //     setSelectedBulk([]);
  //     setBulkRemarks({});
  //     setConfirmationOpen(false);
  //   } catch (error) {
  //     setSnackbar({ open: true, message: "Failed to update PO status.", severity: "error" });
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handlePOAction = async (action) => {
    const requiresRemark = action === "reject";
    const hasEmptyRemarks = selectedBulk.some(id => !bulkRemarks[id]?.trim());
  
    if (requiresRemark && hasEmptyRemarks) {
      setSnackbar({
        open: true,
        message: "Remarks are mandatory for rejection.",
        severity: "warning",
      });
      return;
    }
  
    setActionLoading(true);
  
    // Assuming you get bulkId from the selected bulk
    const bulkId = selectedBulk[0]; // Modify this logic as needed to retrieve the correct bulkId
  
    if (!bulkId) {
      setSnackbar({
        open: true,
        message: "No bulk ID selected.",
        severity: "error",
      });
      setActionLoading(false);
      return;
    }
  
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedInUser) {
        throw new Error("User not found in local storage");
      }
  
      const apiUrl = `http://localhost:5000/api/bulkupload/uploads/${bulkId}/action`; // Use the bulkId in URL
  
      const remarks = bulkRemarks[selectedBulk[0]] || ""; // Assuming remarks for rejection/approval come from the first selected item
      const response = await axios.post(apiUrl, {
        action,
        remarks,
        approved_by: loggedInUser.emp_id,
      });
  
      setSnackbar({
        open: true,
        message: `POs ${action === "approve" ? "approved" : "rejected"} successfully!`,
        severity: "success",
      });
  
      fetchBulkUploads(); // Refresh the list of bulk uploads
      setSelectedBulk([]); // Reset selected bulk
      setBulkRemarks({}); // Reset remarks
      setConfirmationOpen(false); // Close confirmation dialog
    } catch (error) {
      console.error("Error during action:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update PO status.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  const allCurrentPageSelected = filteredBulk
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .every(bulk => selectedBulk.includes(bulk.bulk_id));

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ backgroundColor: "#f5f7fa", borderRadius: 3, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Bulk Upload Approvals
        </Typography>

        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by ID or Requester"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250, backgroundColor: "white" }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchBulkUploads}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={allCurrentPageSelected} onChange={handleSelectAllChange} />
                    </TableCell>
                    <TableCell>S.No</TableCell>
                    <TableCell>Bulk ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Preview</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBulk.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bulk, idx) => (
                    <TableRow key={bulk.bulk_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBulk.includes(bulk.bulk_id)}
                          onChange={() => handleBulkSelect(bulk.bulk_id)}
                        />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{bulk.bulk_id}</TableCell>
                      <TableCell>{bulk.bulk_status}</TableCell>
                      <TableCell>{bulk.requested_by}</TableCell>
                      <TableCell>
                      <IconButton
                        onClick={() => {
                          setDetailedBulkId(bulk.bulk_id);
                          fetchBulkDetails(bulk.bulk_id);
                          setOpenDialog(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton> 
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          disabled={!selectedBulk.includes(bulk.bulk_id)}
                          value={bulkRemarks[bulk.bulk_id] || ""}
                          onChange={(e) => handleRemarkChange(bulk.bulk_id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmAction("reject") || setConfirmationOpen(true)}
                disabled={selectedBulk.length === 0 || actionLoading}
                sx={{ mr: 2 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setConfirmAction("approve") || setConfirmationOpen(true)}
                disabled={selectedBulk.length === 0 || actionLoading}
              >
                Approve
              </Button>
            </Box>

            <TablePagination
              component="div"
              count={filteredBulk.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>
            Bulk Upload Preview - ID: {detailedBulkId}
            <IconButton
              onClick={() => setOpenDialog(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {detailedBulkData ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Asset Number</TableCell>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>Make</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Asset Purchased From</TableCell>
                      <TableCell>PO NUM</TableCell>
                      <TableCell>Invoice Num</TableCell>
                      <TableCell>Purchased Date</TableCell>
                      <TableCell>Asset Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>EMP ID</TableCell>
                      <TableCell>Employee Name</TableCell>
                      <TableCell>Employee Email</TableCell>
                      <TableCell>Employee Designation</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Reporting Manager</TableCell>
                      <TableCell>Emp Mob</TableCell>
                      <TableCell>Host Name</TableCell>
                      <TableCell>Assigned Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
          {detailedBulkData.assets.map((asset, index) => (
            <TableRow key={asset.asset_id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{asset.asset_id}</TableCell>
              <TableCell>{asset.asset_type}</TableCell>
              <TableCell>{asset.brand}</TableCell>
              <TableCell>{asset.model}</TableCell>
              <TableCell>{asset.imei_num}</TableCell>
              <TableCell>{asset.description}</TableCell>
              <TableCell>
                {detailedBulkData.poProcessing && detailedBulkData.poProcessing.length > 0
                  ? detailedBulkData.poProcessing[0].vendor_name // Example: take first PO's vendor name
                  : "N/A"}
              </TableCell>
              <TableCell>{asset.po_num}</TableCell>
              <TableCell>
                {detailedBulkData.poProcessing && detailedBulkData.poProcessing.length > 0
                  ? detailedBulkData.poProcessing[0].invoice_num // Example: take first PO's invoice number
                  : "N/A"}
              </TableCell>
              <TableCell>
                {detailedBulkData.poProcessing && detailedBulkData.poProcessing.length > 0
                  ? detailedBulkData.poProcessing[0].invoice_date // Example: take first PO's invoice date
                  : "N/A"}
              </TableCell>
              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.assignment_status)
                      .join(", ")
                  : "N/A"}
              </TableCell>
              <TableCell>{asset.base_location}</TableCell>
              <TableCell>{asset.state}</TableCell>

              {/* Employee Details */}
              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.emp_id || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.emp_name || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.email || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.designation_name || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.department_name || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.reporting_manager || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>
                {detailedBulkData.assignments && detailedBulkData.assignments.length > 0
                  ? detailedBulkData.assignments
                      .filter(assignment => assignment.asset_id === asset.asset_id)
                      .map(assignment => assignment.emp_mobile || "N/A")
                      .join(", ")
                  : "N/A"}
              </TableCell>

              <TableCell>{asset.host_name}</TableCell>
              <TableCell>{asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString() : "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>




                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
          <DialogTitle>Confirm {confirmAction === "approve" ? "Approval" : "Rejection"}</DialogTitle>
          <DialogContent>Are you sure you want to {confirmAction} selected bulk uploads?</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
            <Button
              onClick={() => handlePOAction(confirmAction)}
              color={confirmAction === "approve" ? "primary" : "error"}
              variant="contained"
              disabled={actionLoading}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default BulkUploadPage;
