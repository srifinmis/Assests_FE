import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Autocomplete,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'; // Top of your file
import axios from "axios";
import * as XLSX from 'xlsx';

const UploadInvoice = () => {
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [file, setFile] = useState(null);
  const [baseLocation, setBaseLocation] = useState("");
  const [state, setState] = useState("");
  const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([])
  const [Warranty, setWarranty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const [poOptions, setPoOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [rowsByProductIndex, setRowsByProductIndex] = useState({});
  const [productMetaData, setProductMetaData] = useState({});
  const [duplicateSerials, setDuplicateSerials] = useState(new Set());
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [assetCreationAt, setAssetCreationAt] = useState("");

  const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

  useEffect(() => {
    axios
      .get(`${API_CONFIG.APIURL}/invoices/po_no`)
      .then((res) => setPoOptions(res.data))
      .catch((err) => console.error("❌ Error fetching PO numbers:", err));
  }, []);

  const handlePoSelection = async (po) => {
    setPoNumber(po); // Store the selected PO number
    setProducts([]); // Reset previous products
    setAssetType(""); // Reset asset type
    setRowsByProductIndex({}); // Reset rows by product index
    setProductMetaData({}); // Reset product metadata
    setBaseLocation(""); // Reset base location
    setState(""); // Reset state
    setWarranty(""); // Reset warranty
    setLoading(true); // Set loading state to true
  
    try {
      // Fetch PO details from the backend API
      const { data } = await axios.get(
        `${API_CONFIG.APIURL}/invoices/po_details/${encodeURIComponent(po)}`
      );
  
      // Set asset creation type
      setAssetCreationAt(data.asset_creation_at || "");
  
      // If asset creation type is "payment", fetch products and generate asset IDs
      if (data.asset_creation_at === "invoice" && data.products.length > 0) {
        setAssetType(data.asset_type); // Set asset type from PO details
        setProducts(data.products); // Set products for this PO
  
        // Validate quantities and calculate total quantity
        const totalUnits = data.products.reduce((sum, p) => {
          if (isNaN(p.quantity) || p.quantity < 0) {
            console.error(`❌ Invalid quantity for product:`, p);
            return sum; // Skip invalid quantities
          }
          return sum + p.quantity;
        }, 0);
  
        if (totalUnits <= 0) {
          console.error("❌ Total quantity is invalid:", totalUnits);
          alert("Invalid total quantity. Please check the product quantities.");
          return;
        }
  
        // Fetch generated asset IDs based on PO number
        const { data: assetIdData } = await axios.get(
          `${API_CONFIG.APIURL}/invoices/next-asset-ids/${encodeURIComponent(po)}`
        );
  
        const assetIds = assetIdData.generated_asset_ids; // Get generated asset IDs
  
        // Validate that generated asset IDs match the total units
        if (assetIds.length !== totalUnits) {
          console.error("❌ Mismatch in asset count:", assetIds.length, totalUnits);
          alert("Mismatch between total quantity and generated asset IDs.");
          return;
        }
  
        // Generate initial rows for the products based on asset IDs
        const initialRows = {};
        let idPointer = 0;
  
        // Loop through the products to assign generated asset IDs to each row
        data.products.forEach((product, index) => {
          const rows = [];
          for (let j = 0; j < product.quantity; j++) {
            rows.push({
              asset_id: assetIds[idPointer++], // Assign asset ID
              serial_number: "", // Initial serial number (to be filled later)
              productIndex: index, // Store the product index
            });
          }
          initialRows[index] = rows; // Store rows for this product
        });
  
        // Update the state with the generated rows
        setRowsByProductIndex(initialRows);
      }
    } catch (err) {
      console.error("❌ Failed to fetch PO details:", err);
      alert("Failed to fetch PO details. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false when the request is done
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validate file type and size (optional: max 5MB)
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB.");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
  
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        const serialNumbers = excelData
          .map(row => row.serial_no?.toString().trim())
          .filter(sn => !!sn); // Remove empty/null values
  
        const updatedRows = { ...rowsByProductIndex };
        let serialIndex = 0;
  
        Object.keys(updatedRows).forEach((productIndex) => {
          updatedRows[productIndex] = updatedRows[productIndex].map((row) => {
            const serial_no = serialNumbers[serialIndex] || "";
            serialIndex++;
            return { ...row, serial_no };
          });
        });
  
        setRowsByProductIndex(updatedRows);
        setExcelFile(file); // For UI display
  
      } catch (err) {
        console.error("Error parsing Excel file:", err);
        alert("Failed to read the Excel file. Please check the format.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };  
  
  const handleMetaChange = (index, field, value) => {
    setProductMetaData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  const handleRowChange = (productIndex, rowIndex, field, value) => {
    const updatedRows = { ...rowsByProductIndex };
    updatedRows[productIndex][rowIndex][field] = value;
    setRowsByProductIndex(updatedRows);
  
    if (field === "serial_no") {
      checkForDuplicateSerials(updatedRows);
    }
  };

  const checkForDuplicateSerials = (allRows) => {
    const seen = new Set();
    const duplicates = new Set();
  
    Object.values(allRows).forEach((rows) => {
      rows.forEach((row) => {
        const sn = row.serial_no?.trim();
        if (sn) {
          if (seen.has(sn)) {
            duplicates.add(sn);
          } else {
            seen.add(sn);
          }
        }
      });
    });
  
    setDuplicateSerials(duplicates);
  };  
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (selectedFile.size > 5000000) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    setFile(selectedFile);
    setError("");
  };
  
  const resetForm = () => {
    setPoNumber("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setFile(null);
    setBaseLocation("");
    setState("");
    setWarranty("");
    setError("");
    setLoading(false);
    setRowsByProductIndex({});
    setProductMetaData({});
    setDuplicateSerials(new Set());
    setAssetType("");
    setPoOptions([]);
    setProducts([]);
    setSelectedProductIndex(null); 
    setAssetCreationAt("");
  };  

  useEffect(() => {
    fetch(`${API_CONFIG.APIURL}/invoices/locations`)
      .then((res) => res.json())
      .then((data) => {
        setBaseLocationOptions(data.baseLocations || []);
        setStateOptions(data.states || []);
      })
      .catch((err) => console.error('Failed to fetch locations', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Basic validation
    if (!poNumber || !invoiceNumber || !invoiceDate || !file) {
      return setError("Please fill out all required fields and upload a file.");
    }
  
    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    const requestedBy = loggedInUser.emp_id;
    if (!requestedBy) {
      setError("❌ User not logged in. Please log in and try again.");
      setLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("po_number", poNumber);
    formData.append("invoice_number", invoiceNumber);
    formData.append("invoice_date", invoiceDate);
    formData.append("invoiceFile", file);
    formData.append("requested_by", requestedBy);
  
    if (assetCreationAt === "invoice") {
      // Validate baseLocation and state
      if (!baseLocation || !state || !Warranty) {
        return setError("Please fill Base Location, State and Warranty.");
      }
  
      // Check for duplicate serial numbers
      const allSerialNumbers = new Set();
      const duplicateSerials = new Set();
  
      Object.values(rowsByProductIndex).forEach((rows) => {
        rows.forEach((row) => {
          const serialNo = row.serial_no?.trim();
          if (allSerialNumbers.has(serialNo)) {
            duplicateSerials.add(serialNo);
          }
          allSerialNumbers.add(serialNo);
        });
      });
  
      if (duplicateSerials.size > 0) {
        return setError(`Duplicate serial number(s) found: ${[...duplicateSerials].join(", ")}`);
      }
  
      formData.append("base_location", baseLocation);
      formData.append("state", state);
      formData.append("Warranty_status", Warranty);
      formData.append("asset_type", assetType);
  
      // Combine asset data
      const assetData = [];
      products.forEach((product, index) => {
        const brand = productMetaData[index]?.brand || "";
        const model = productMetaData[index]?.model || "";
        const rows = rowsByProductIndex[index] || [];
  
        rows.forEach((row) => {
          assetData.push({
            asset_id: row.asset_id,
            serial_no: row.serial_no,
            brand,
            model,
            product_index: index,
          });
        });
      });
  
      formData.append("assetData", JSON.stringify(assetData));
    }
  
    try {
      setLoading(true);
      const response = await axios.post(`${API_CONFIG.APIURL}/invoices/upload_invoice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data.message) {
        alert("✅ Invoice uploaded successfully!");
        resetForm();
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const { message, duplicateSerials } = err.response.data;
  
        if (duplicateSerials?.length > 0) {
          setDuplicateSerials(new Set(duplicateSerials));
          setError(`❌ Duplicate serial number(s) found: ${duplicateSerials.join(", ")}`);
        } else {
          setError(message || err.response.data.error || "Failed to upload. Please try again.");
        }
      } else {
        setError("Failed to upload. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <Container maxWidth="md">
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h5" textAlign="center" gutterBottom>
              Upload Invoice 
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={poOptions}
                    value={poNumber}
                    onChange={(e, val) => handlePoSelection(val)}
                    renderInput={(params) => <TextField {...params} label="PO Number" required />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Invoice Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Invoice Date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>

              

              <Box
                onClick={() => document.getElementById("fileInput").click()}
                sx={{
                  border: "2px dashed #1976d2",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {file ? (
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <InsertDriveFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography sx={{ ml: 2 }}>{file.name}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography>Click or Drag PDF file here</Typography> 
                    <Typography variant="body2" color="textSecondary"> Please upload the invoice file (Max 5MB, only PDF)</Typography>
                  </Box>
                )}
              </Box>
              
              {/* Show Base Location and State only ONCE before the product list */}
              
              {products.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      freeSolo
                      options={baseLocationOptions}
                      value={baseLocation}
                      onChange={(e, newValue) => setBaseLocation(newValue || '')}
                      onInputChange={(e, newInputValue) => setBaseLocation(newInputValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Base Location" required fullWidth />
                      )}
                    />
                  </Grid> 
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      freeSolo
                      options={stateOptions}
                      value={state}
                      onChange={(e, newValue) => setState(newValue || '')}
                      onInputChange={(e, newInputValue) => setState(newInputValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="State" required fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Warranty"
                      value={Warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      required
                      fullWidth
                      type="number" // Ensures numeric input only
                    />
                  </Grid>
                  <Grid item xs={12} >
                    <Box
                      onClick={() => document.getElementById("excelInput").click()}
                      sx={{
                        border: "2px dashed #1976d2",
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        textAlign: "center",
                        backgroundColor: "#f5f5f5",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="file"
                        id="excelInput"
                        accept=".xlsx,.xls"
                        style={{ display: "none" }}
                        onChange={handleExcelUpload}
                      />
                      {excelFile ? (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <InsertDriveFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                          <Typography sx={{ ml: 2 }}>{excelFile.name}</Typography>
                        </Box>
                      ) : (
                        <Box>
                          <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                          <Typography>Click or Drag Excel file here</Typography>
                          <Typography variant="body2" color="textSecondary"> Please upload the Excel file for serial numbers (Max 5MB, only .xlsx/.xls)</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                </Grid>
              )}

              {products.map((product, i) => (
                <Box key={i} sx={{ mb: 3, border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {product.asset_type} - {product.item_description} ({product.quantity} units)
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Brand"
                        value={productMetaData[i]?.brand || ""}
                        onChange={(e) => handleMetaChange(i, "brand", e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Model"
                        value={productMetaData[i]?.model || ""}
                        onChange={(e) => handleMetaChange(i, "model", e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid> 
                  </Grid>

                  {rowsByProductIndex[i]?.map((row, j) => (
                    <Grid container spacing={2} key={j} sx={{ mb: 1 }}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Asset ID"
                          value={row.asset_id}
                          disabled
                          fullWidth
                        />
                      </Grid> 
                      <Grid item xs={12} sm={9}>
                        <TextField
                          label="Serial Number"
                          value={row.serial_no || ""}
                          onChange={(e) =>
                            handleRowChange(i, j, "serial_no", e.target.value)
                          }
                          required
                          fullWidth
                          error={duplicateSerials.has((row.serial_no || "").trim())}
                          helperText={
                            duplicateSerials.has((row.serial_no || "").trim())
                              ? "Duplicate serial number"
                              : ""
                          }
                        />
                      </Grid>
                    </Grid>
                  ))}                  
                </Box>
              ))}


              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Uploading..." : "Submit Invoice "}
              </Button>

              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default UploadInvoice;
