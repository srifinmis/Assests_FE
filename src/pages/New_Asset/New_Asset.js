import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Autocomplete,
} from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit"; // ✅ Add this line
import axios from "axios";

const NewAsset = () => {
  const [poNumber, setPoNumber] = useState("");
  const [poOptions, setPoOptions] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [assetRows, setAssetRows] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    asset_id: "",
    asset_type: "",
    brand: "",
    model: "",
    imei_num: "",
    po_num: "",
    warranty_status: "",
    base_location: "",
    state: "",
  });

   // ✅ Fetch PO Numbers from Backend
   useEffect(() => {
    axios
    .get("http://localhost:5000/api/new-asset/po-numbers")
      .then((response) => {
        setPoOptions(response.data);
      })
      .catch((error) => {
        console.error("❌ Error fetching PO numbers:", error);
      });
  }, []);
  
  // Fetch Invoice Number when PO Number is entered
  const handlePoNumberChange = async (_, newValue) => {
    if (!newValue) {
      setPoNumber("");
      setInvoiceNumber("");
      return;
    }
  
    setPoNumber(newValue);
    setNewAsset((prev) => ({ ...prev, po_num: newValue })); // ✅ Update newAsset's PO Number
  
    try {
      const response = await axios.get(`http://localhost:5000/api/new-asset/get-invoice/${newValue}`);
      setInvoiceNumber(response.data.invoice_number || "Not Found");
    } catch (error) {
      console.error("❌ Error fetching invoice number:", error);
      setInvoiceNumber("Not Found");
    }
  };

  // Open & Close Modal
  const handleOpenModal = (field = null) => {
    if (field !== null && assetRows[field]) {
      // Editing an existing asset
      setEditIndex(field);
      setNewAsset({ ...assetRows[field] }); 
    } else {
      // Adding a new asset
      setEditIndex(null);
      setNewAsset({
        asset_id: "",
        asset_type: "",
        brand: "",
        model: "",
        imei_num: "",
        po_num: poNumber || "",
        warranty_status: "",
        base_location: "",
        state: "",
      });
    }
  
    setOpenModal(true); // Open modal
  };

    const handleCloseModal = () => {
    setOpenModal(false);
    setNewAsset({
      asset_id: "",
      asset_type: "",
      brand: "",
      model: "",
      imei_num: "",
      po_num:"",
      warranty_status: "",
      base_location: "",
      state: "",
    });
  };

  const handleAddAsset = () => {
    const requiredFields = ["asset_id", "asset_type", "brand", "model", "po_num"];
  
    for (const field of requiredFields) {
      if (!newAsset[field]) {
        setErrorMessage(`Please fill out the ${field.replace("_", " ").toUpperCase()} field.`);
        setOpenSnackbar(true);
        return;
      }
    }
  
    // ✅ Prevent duplicate Asset ID except when editing
    if (editIndex === null && assetRows.some((row) => row.asset_id === newAsset.asset_id)) {
      setErrorMessage("Asset ID already exists. Please enter a unique Asset ID.");
      setOpenSnackbar(true);
      return;
    }
  
    const updatedAsset = { ...newAsset, po_num: poNumber };
    if (editIndex !== null) {
      const updatedRows = [...assetRows];
      updatedRows[editIndex] = updatedAsset;
      setAssetRows(updatedRows);
    } else {
      setAssetRows([...assetRows, updatedAsset]);
    }
  
    handleCloseModal();
  };
    
  const handleEditAsset = () => {
    const requiredFields = ["asset_id", "asset_type", "brand", "model", "po_num"];
  
    for (const field of requiredFields) {
      if (!newAsset[field]) {
        setErrorMessage(`Please fill out the ${field.replace("_", " ").toUpperCase()} field.`);
        setOpenSnackbar(true);
        return;
      }
    }
  
    if (editIndex !== null) {
      // ✅ Edit existing asset
      const updatedRows = [...assetRows];
      updatedRows[editIndex] = newAsset;
      setAssetRows(updatedRows);
    }
  
    handleCloseModal();
  };
  
  

  // Remove asset row
  const handleRemoveRow = (field) => {
    const updatedRows = assetRows.filter((_, i) => i !== field);
    setAssetRows(updatedRows);
  };

  // Handle field changes in modal
  const handleFieldChange = (field, value) => {
    setNewAsset((prev) => ({ ...prev, [field]: value }));
  };
  
  // Submit Assets
  const handleSubmit = async () => {
    if (assetRows.length === 0) {
      setErrorMessage("Please add at least one asset before submitting.");
      setOpenSnackbar(true);
      return;
    }
  
    try {
      const currentDateTime = new Date().toISOString(); // ✅ Get current timestamp
  
      const assetsPayload = assetRows.map((asset) => ({
        ...asset,
        po_num: poNumber, // Ensure PO Number is included
        assignment_status: "FreePool", // ✅ Set assignment status
        assigned_date: currentDateTime, // ✅ Set current timestamp
      }));
  
      const response = await axios.post("http://localhost:5000/api/new-asset/add", assetsPayload);
  
      if (response.status === 201) {
        alert("✅ Assets added successfully!");
        setAssetRows([]);
        setPoNumber("");
        setInvoiceNumber("");
      }
    } catch (error) {
      console.error("❌ Error adding assets:", error);
      setErrorMessage("Failed to add assets. Try again.");
      setOpenSnackbar(true);
    }
  };
  

  return (
    <>
    <Navbar/>
      <Box
        sx={{
          maxWidth: 1000,
          margin: "auto",
          mt: 5,
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center", color: "#1565C0" }}>
          New Asset Creation
        </Typography>

        {/* ✅ Step 1: PO Number & Invoice Number */}
        <Box sx={{ backgroundColor: "#E3F2FD", p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
            Step 1: Select PO Number
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {/* ✅ PO Number Selection */}
              <Autocomplete
                  options={poOptions}
                  value={poNumber}
                  onChange={handlePoNumberChange}
                  getOptionLabel={(option) => option.toString()} // ✅ Fix for handling different data types
                  renderInput={(params) => (
                      <TextField {...params} label="PO Number" variant="outlined" fullWidth required />
                  )}
              />

            </Grid>
            <Grid item xs={12} sm={6}>
              {/* ✅ Invoice Number */}
              <TextField label="Invoice Number" variant="outlined" fullWidth value={invoiceNumber} disabled />
            </Grid>
          </Grid>
        </Box>

        {/* Step 2: Add Asset */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Step 2: Add Asset
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenModal} sx={{ mt: 2 }}>
            Add Asset
          </Button>
        </Box>

        {/* Step 3: Asset Table */}
        {assetRows.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1565C0" }}>
                  {["Asset ID", "Asset Type", "Brand", "Model", "IMEI", "PO Number","Warranty", "Location", "State", "Actions"].map((heading) => (
                    <TableCell key={heading} sx={{ color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {assetRows.map((row, field) => (
                  <TableRow key={field} sx={{ backgroundColor: field % 2 === 0 ? "#f9f9f9" : "#e3f2fd" }}>
                    {Object.values(row).map((value, i) => (
                      <TableCell key={i}>{value}</TableCell>
                    ))}
                    <TableCell align="center">
                    <Tooltip title="Edit Row">
                      <IconButton color="primary" onClick={() => handleOpenModal(field)}>
                        <EditIcon /> {/* ✅ Correct Edit Icon */}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Row">
                      <IconButton color="error" onClick={() => handleRemoveRow(field)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Step 4: Submit */}
        <Button variant="contained" color="success" fullWidth sx={{ mt: 3, py: 1.5 }} onClick={handleSubmit}>
          Submit Assets
        </Button>

        {/* Asset Modal */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{editIndex !== null ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogContent>
          {newAsset ? Object.keys(newAsset).map((key) => (
            <TextField
              key={key}
              label={key.replace("_", " ").toUpperCase()}
              fullWidth
              sx={{ my: 1 }}
              value={newAsset[key] || ""}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
          )): null}

          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={editIndex !== null ? handleEditAsset : handleAddAsset} color="primary">
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>


        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default NewAsset;