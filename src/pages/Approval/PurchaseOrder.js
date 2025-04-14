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

const POApprovalPage = () => {
  const [poData, setPoData] = useState([]);
  const [filteredPOs, setFilteredPOs] = useState([]);
  const [selectedPOs, setSelectedPOs] = useState([]);
  const [poRemarks, setPoRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchPOs();
  }, []);

  useEffect(() => {
    setFilteredPOs(poData);
  }, [poData]);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/purchaseorder/po");
      if (Array.isArray(res.data)) {
        setPoData(res.data);
      } else {
        throw new Error("Fetched data is not an array.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch PO data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = poData.filter(po =>
      String(po.po_number).toLowerCase().includes(query) ||
      String(po.utr_number).toLowerCase().includes(query)
    );
    setFilteredPOs(filtered);
  };

  const handlePOSelect = (id) => {
    setSelectedPOs((prev) =>
      prev.includes(id) ? prev.filter((poId) => poId !== id) : [...prev, id]
    );
  };

  const handleSelectAllChange = (e) => {
    const currentPagePOs = filteredPOs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const newSelection = e.target.checked
      ? [...new Set([...selectedPOs, ...currentPagePOs.map(po => po.assignment_id)])]
      : selectedPOs.filter(id => !currentPagePOs.some(po => po.assignment_id === id));
    setSelectedPOs(newSelection);
  };

  const handlePORemarkChange = (id, value) => {
    setPoRemarks((prev) => ({ ...prev, [id]: value }));
  };

  const handlePOAction = async (action) => {
    if (action === "reject" || action === "approve") {
      const hasEmptyRemarks = selectedPOs.some(id => !poRemarks[id]?.trim());
      if (hasEmptyRemarks) {
        setSnackbar({
          open: true,
          message: "Remarks are mandatory for rejection.",
          severity: "warning",
        });
        return;
      }
    }
  
    setActionLoading(true); // Start loading
    console.log("remarks:",  poRemarks);

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const apiUrl = "http://localhost:5000/api/purchaseorder/action";
    
      const remarksList = selectedPOs.map((id) => ({
        assignment_id: id,
        remarks: poRemarks[id] || "",
      }));
    
      const extractedRemark = remarksList.length > 0 ? remarksList[0].remarks : "";
      console.log("remarks:",  action);

      await axios.post(apiUrl, {
        assignmentIds: selectedPOs,
        action,
        approved_by: loggedInUser.emp_id,
        remarksList,             // full list
        remark: extractedRemark, // single remark
      });
    
      setSnackbar({
        open: true,
        message: `POs ${action === "approve" ? "approved" : "rejected"} successfully!`,
        severity: "success",
      });
    
      fetchPOs();
      setSelectedPOs([]);
      setPoRemarks({});
      setConfirmationOpen(false); // Close dialog after success
    } catch (error) {
      console.error("Error handling PO action", error);
      setSnackbar({ open: true, message: "Failed to update PO status.", severity: "error" });
    } finally {
      setActionLoading(false); // Stop loading
    }
  };
  
  const openConfirmationDialog = (actionType) => {
    setConfirmAction(actionType);
    setConfirmationOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await handlePOAction(confirmAction);
    }
    setConfirmationOpen(false);
  };

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allCurrentPageSelected = filteredPOs
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .every(po => selectedPOs.includes(po.assignment_id));

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ backgroundColor: "#F9FAFB", borderRadius: 2, p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
          Purchase Order Approvals
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: "column", sm: "row" }}>
          <TextField
            placeholder="Search ..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: { xs: "100%", sm: "40%" }, mb: { xs: 2, sm: 0 }, backgroundColor: "white" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh PO List">
            <IconButton onClick={fetchPOs}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Snackbar open={true} autoHideDuration={6000}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : filteredPOs.length === 0 ? (
          <Typography variant="h6" align="center" color="textSecondary">
            No assigned assets found.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                  <TableCell><Checkbox checked={allCurrentPageSelected} onChange={handleSelectAllChange} /></TableCell>
                  <TableCell>S.No</TableCell>
                  <TableCell>Assignment ID</TableCell>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Preview</TableCell>
                  <TableCell>Remark</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPOs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((po, index) => (
                    <TableRow key={po.assignment_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPOs.includes(po.assignment_id)}
                          onChange={() => handlePOSelect(po.assignment_id)}
                        />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{po.assignment_id}</TableCell>
                      <TableCell>{po.po_num}</TableCell>
                      <TableCell>{po.po_status}</TableCell>
                      <TableCell>{po.requested_by}</TableCell>
                      <TableCell>
                        <IconButton
                          href={po.po_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Preview PDF"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          disabled={!selectedPOs.includes(po.assignment_id)}
                          value={poRemarks[po.assignment_id] || ""}
                          onChange={(e) => handlePORemarkChange(po.assignment_id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: "column", sm: "row" }}>
          <TablePagination
            component="div"
            count={filteredPOs.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />

          <Box mt={{ xs: 2, sm: 0 }} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              disabled={selectedPOs.length === 0}
              onClick={() => openConfirmationDialog("approve")}
            >
              Approve PO
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={selectedPOs.length === 0}
              onClick={() => openConfirmationDialog("reject")}
            >
              Reject PO
            </Button>
          </Box>
        </Box>

        <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
          <DialogTitle>Confirm {confirmAction === "approve" ? "Approval" : "Rejection"}</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {confirmAction} the selected PO(s)?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              disabled={actionLoading}
              onClick={handleConfirmAction}
              sx={{ width: { xs: "100%", sm: "auto" }, maxWidth: "200px" }}
            >
              {actionLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default POApprovalPage;
