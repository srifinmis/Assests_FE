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
import axios from "axios";

const UploadReceipt = () => {
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setUtrNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [file, setFile] = useState(null);
  const [baseLocation, setBaseLocation] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [poOptions, setPoOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [rowsByProductIndex, setRowsByProductIndex] = useState({});
  const [productMetaData, setProductMetaData] = useState({});
  

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/invoices/po_no")
      .then((res) => setPoOptions(res.data))
      .catch((err) => console.error("❌ Error fetching PO numbers:", err));
  }, []);

  const handlePoSelection = async (po) => {
    setPoNumber(po);
    setProducts([]);
    setAssetType("");
    setRowsByProductIndex({});
    setProductMetaData({});
    setBaseLocation("");
    setState("");

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/invoices/po_details/${encodeURIComponent(po)}`
      );
      if (data.asset_creation_at === "invoice" && data.products.length > 0) {
        setAssetType(data.asset_type);
        setProducts(data.products);

        const totalUnits = data.products.reduce((sum, p) => sum + p.quantity, 0);
        const { data: assetIdData } = await axios.get(
          `http://localhost:5000/api/invoices/next-asset-ids/${totalUnits}`
        );
        const assetIds = assetIdData.nextAssetIds;

        const initialRows = {};
        let idPointer = 0;
        data.products.forEach((product, index) => {
          const rows = [];
          for (let j = 0; j < product.quantity; j++) {
            rows.push({
              asset_id: assetIds[idPointer++],
              serial_number: "",
              productIndex: index,
            });
          }
          initialRows[index] = rows;
        });

        setRowsByProductIndex(initialRows);
      }
    } catch (err) {
      console.error("❌ Failed to fetch PO details:", err);
    }
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

  const handleAddRow = async (productIndex) => {
    const currentRows = rowsByProductIndex[productIndex] || [];
    const remaining = products[productIndex].quantity - currentRows.length;
    if (remaining <= 0) return;
    try {
      const { data: assetIds } = await axios.get(
        `http://localhost:5000/api/invoices/next-asset-ids/${remaining}`
      );
      const newRow = {
        asset_id: assetIds[0],
        serial_number: "",
        productIndex,
      };
      setRowsByProductIndex((prev) => ({
        ...prev,
        [productIndex]: [...(prev[productIndex] || []), newRow],
      }));
    } catch (err) {
      console.error("❌ Failed to fetch asset_id:", err);
    }
  };

  const handleRowChange = (productIndex, rowIndex, field, value) => {
    setRowsByProductIndex((prev) => {
      const updated = [...(prev[productIndex] || [])];
      updated[rowIndex][field] = value;
      return { ...prev, [productIndex]: updated };
    });
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

  //  const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  
  //   if (!poNumber || !invoiceNumber || !invoiceDate || !file) {
  //     return setError("Please fill out all required fields and upload a file.");
  //   }
  
  //   if (products.length > 0 && (!baseLocation || !state)) {
  //     return setError("Please fill Base Location and State.");
  //   }
  
  //   for (let i = 0; i < products.length; i++) {
  //     const meta = productMetaData[i];
  //     if (!meta || !meta.brand || !meta.model) {
  //       return setError(`Please fill brand and model for product ${i + 1}.`);
  //     }
   
  //     const rows = rowsByProductIndex[i] || [];
  //     if (rows.length !== products[i].quantity) {
  //       return setError(`Please add ${products[i].quantity} asset rows for product ${i + 1}.`);
  //     }
  
  //     for (let j = 0; j < rows.length; j++) {
  //       if (!rows[j].serial_no) {
  //         return setError(`Serial number is required for asset ${j + 1} of product ${i + 1}.`);
  //       }
  //     }
  //   }
  
  //   const formData = new FormData();
  //   formData.append("po_number", poNumber);
  //   formData.append("invoice_number", invoiceNumber);
  //   formData.append("invoice_date", invoiceDate);
  //   formData.append("invoiceFile", file);
  //   formData.append("base_location", baseLocation);
  //   formData.append("state", state);
  //   formData.append("asset_type", assetType);
    
  //   // Combine asset data
  //   const assetData = [];
  //   products.forEach((product, index) => {
  //     const brand = productMetaData[index]?.brand || "";
  //     const model = productMetaData[index]?.model || "";
  //     const rows = rowsByProductIndex[index] || [];
  
  //     rows.forEach((row) => {
  //       assetData.push({
  //         asset_id: row.asset_id,
  //         serial_no: row.serial_no,
  //         brand,
  //         model,
  //         product_index: index,
  //       });
  //     });
  //   });
  
  //   formData.append("assetData", JSON.stringify(assetData));
  
  //   const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  //   const requestedBy = loggedInUser.emp_id;
  //   if (!requestedBy) {
  //     setError("❌ User not logged in. Please log in and try again.");
  //     setLoading(false);
  //     return;
  //   }
  
  //   formData.append("requested_by", requestedBy);
  
  //   try {
  //     setLoading(true);
  //     const response = await axios.post("http://localhost:5000/api/invoices/upload_receipt", formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  
  //     if (response.data.message) {
  //       response.success("✅ Receipt uploaded successfully!");
  //       // Reset state logic here if needed
  //     } else {
  //       setError(response.data.message || "Something went wrong.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to upload. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Fetch the `asset_creation_at` from the selected PO data
  const assetCreationAt = products[0]?.asset_creation_at; // Assuming asset_creation_at is consistent across products

  // Validation logic based on asset_creation_at value
  if (assetCreationAt === "invoice") {
    if (!poNumber || !invoiceNumber || !invoiceDate || !file) {
      return setError("Please fill out all required fields and upload a file.");
    }
  }

  if (assetCreationAt === "invoice" && products.length > 0 && (!baseLocation || !state)) {
    return setError("Please fill Base Location and State.");
  }

  for (let i = 0; i < products.length; i++) {
    const meta = productMetaData[i];
    if (!meta || !meta.brand || !meta.model) {
      return setError(`Please fill brand and model for product ${i + 1}.`);
    }

    const rows = rowsByProductIndex[i] || [];
    if (rows.length !== products[i].quantity) {
      return setError(`Please add ${products[i].quantity} asset rows for product ${i + 1}.`);
    }

    for (let j = 0; j < rows.length; j++) {
      if (!rows[j].serial_no) {
        return setError(`Serial number is required for asset ${j + 1} of product ${i + 1}.`);
      }
    }
  }

  // For asset_creation_at = 'Payment', validate the required fields (poNumber, invoiceNumber, invoiceDate, and file)
  if (assetCreationAt === "Payment" && (!poNumber || !invoiceNumber || !invoiceDate || !file)) {
    return setError("Please fill PO Number, Invoice Number, Invoice Date, and upload a file.");
  }

  const formData = new FormData();
  formData.append("po_number", poNumber);
  formData.append("invoice_number", invoiceNumber);
  formData.append("invoice_date", invoiceDate);
  formData.append("invoiceFile", file);
  formData.append("base_location", baseLocation);
  formData.append("state", state);
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

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const requestedBy = loggedInUser.emp_id;
  if (!requestedBy) {
    setError("❌ User not logged in. Please log in and try again.");
    setLoading(false);
    return;
  }

  formData.append("requested_by", requestedBy);

  try {
    setLoading(true);
    const response = await axios.post("http://localhost:5000/api/invoices/upload_receipt", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.message) {
      alert("✅ Receipt uploaded successfully!");
      // Reset state logic here if needed
    } else {
      setError(response.data.message || "Something went wrong.");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to upload. Please try again.");
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
                    onChange={(e) => setUtrNumber(e.target.value)}
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
                    <Typography variant="caption">(Max 5MB, only PDF)</Typography>
                  </Box>
                )}
              </Box>
              
              {/* Show Base Location and State only ONCE before the product list */}
              {products.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Base Location"
                      value={baseLocation}
                      onChange={(e) => setBaseLocation(e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
              )}

              {/* {products.map((product, i) => (
                <Box key={i} sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Product {i + 1}</strong>: {assetType} - {product.item_description} (Units: {product.quantity})
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Brand"
                        value={productMetaData[i]?.brand || ""}
                        onChange={(e) => handleMetaChange(i, "brand", e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Model"
                        value={productMetaData[i]?.model || ""}
                        onChange={(e) => handleMetaChange(i, "model", e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>

                  {(rowsByProductIndex[i] || []).map((row, idx) => (
                    <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
                      {["asset_id", "serial_number"].map((field) => (
                        <Grid item xs={12} sm={6} key={field}>
                          <TextField
                            label={field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            value={row[field] || ""}
                            onChange={(e) => handleRowChange(i, idx, field, e.target.value)}
                            required
                            fullWidth
                            disabled={field === "asset_id"}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ))}

                  <Button
                    variant="outlined"
                    onClick={() => handleAddRow(i)}
                    fullWidth
                    disabled={(rowsByProductIndex[i] || []).length >= product.quantity}
                  >
                    ➕ Add Row for Product {i + 1}
                  </Button>
                </Box>
              ))} */}

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
                        />
                      </Grid>
                    </Grid>
                  ))}

                  <Button
                    variant="outlined"
                    disabled={rowsByProductIndex[i]?.length >= product.quantity}
                    onClick={() => handleAddRow(i)}
                    sx={{ mt: 1 }}
                  >
                    Add Row
                  </Button>
                  
                </Box>
              ))}


              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Uploading..." : "Submit Invoice Receipt"}
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

export default UploadReceipt;
