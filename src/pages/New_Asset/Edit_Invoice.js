import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
    Container, TextField, Button,
    Typography, Card,
    CardContent, Box,
    Autocomplete, Grid, Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import axios from "axios";
import * as XLSX from 'xlsx';

const EditInvoice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const poNum = location.state?.po_number;
    const [poNumber, setPoNumber] = useState(poNum || "");
    const [invoiceURL, setinvoiceURL] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");
    const [file, setFile] = useState(null); // For the invoice PDF file
    const [baseLocation, setBaseLocation] = useState("");
    const [state, setState] = useState("");
    const [Warranty, setWarranty] = useState("");
    const [excelFile, setExcelFile] = useState(null); // For the Excel file with serial numbers
    const [baseLocationOptions, setBaseLocationOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [poOptions, setPoOptions] = useState([]); // Currently not used in Autocomplete, but kept for completeness
    const [products, setProducts] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [openPreview, setOpenPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [assetType, setAssetType] = useState("");
    const [rowsByProductIndex, setRowsByProductIndex] = useState({}); // Stores asset_id and serial_number for each product
    const [productMetaData, setProductMetaData] = useState({}); // Stores brand and model for each product
    const [assetCreationAt, setAssetCreationAt] = useState(""); // Determines if assets are created at PO or invoice

    // UI state
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [duplicateSerials, setDuplicateSerials] = useState(new Set());
    const [invoice, setInvoice] = useState([]); // State to hold fetched invoice data
    const [selectedProductIndex, setSelectedProductIndex] = useState(null); // This was the missing line!

    // Configuration for API endpoints
    const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

    // --- Effect Hook for Initial Data Fetching ---
    useEffect(() => {
        if (poNum) {
            handlePoSelection(poNum);
            axios
                .get(`${API_CONFIG.APIURL}/invoices/pobyids`, {
                    params: {
                        flag: 1,
                        po_num: poNum,
                    },
                })
                .then((res) => {
                    setInvoice(res.data); // Set the raw invoice data
                    console.log("res api flag: ", res.data);

                    // **Populate form fields with existing invoice data**
                    if (res.data) {
                        // Get invoiceAssignment array, take first invoice record
                        const invoiceAssignment = res.data.invoiceAssignment;
                        if (invoiceAssignment && invoiceAssignment.length > 0) {
                            const existingInvoice = invoiceAssignment[0];
                            // console.log("data : ", existingInvoice);

                            setInvoiceNumber(existingInvoice.invoice_num || "");

                            const poProcessinginvoiceurl = res.data.poProcessing?.invoice_url;
                            console.log("processing: ", poProcessinginvoiceurl);

                            // Extract only the part after '/uploads/'
                            let extractedInvoiceFileName = "";
                            if (poProcessinginvoiceurl && poProcessinginvoiceurl.includes('/uploads/')) {
                                extractedInvoiceFileName = poProcessinginvoiceurl.split('/uploads/')[1];
                            }

                            console.log("Extracted File Name: ", extractedInvoiceFileName);
                            setinvoiceURL(extractedInvoiceFileName);

                            // Use invoice_date from poProcessing (object), format to yyyy-mm-dd
                            const invoiceDateRaw = res.data.poProcessing?.invoice_date || "";
                            setInvoiceDate(invoiceDateRaw ? invoiceDateRaw.split('T')[0] : "");

                            // Assuming assetMaster is an array - take first item for these fields (adjust if different)
                            const assetMaster = res.data.assetMaster;
                            if (assetMaster && assetMaster.length > 0) {
                                const assetSample = assetMaster[0];
                                console.log("assetsample: ", assetSample)
                                setBaseLocation(assetSample.base_location || "");
                                setState(assetSample.state || "");
                                setWarranty(assetSample.warranty_status || "");
                                console.log("warrenty: ", assetSample.warranty_status)
                            } else {
                                setBaseLocation("");
                                setState("");
                                setWarranty("");
                            }

                            // Prepare serial numbers and product metadata from assetMaster array
                            if (assetMaster && assetMaster.length > 0) {
                                const newRowsByProductIndex = {};
                                const newProductMetaData = {};

                                assetMaster.forEach(asset => {
                                    // Assuming your asset object has a product_index field
                                    const productIndex = asset.product_index;

                                    if (!newRowsByProductIndex[productIndex]) {
                                        newRowsByProductIndex[productIndex] = [];
                                    }
                                    newRowsByProductIndex[productIndex].push({
                                        asset_id: asset.asset_id,
                                        serial_no: asset.serial_no || "",
                                        productIndex: productIndex,
                                    });

                                    if (!newProductMetaData[productIndex]) {
                                        newProductMetaData[productIndex] = {
                                            brand: asset.brand || "",
                                            model: asset.model || "",
                                        };
                                    }
                                });

                                setRowsByProductIndex(newRowsByProductIndex);
                                setProductMetaData(newProductMetaData);
                                checkForDuplicateSerials(newRowsByProductIndex);
                            }
                        }
                    }
                })
                .catch((err) => console.error("❌ Error fetching invoice data:", err));
        }
    }, [poNum, API_CONFIG.APIURL]); // Dependency array: re-run if poNum or API_CONFIG.APIURL changes

    // --- Effect Hook for fetching Base Locations and States ---
    useEffect(() => {
        fetch(`${API_CONFIG.APIURL}/invoices/locations`)
            .then((res) => res.json())
            .then((data) => {
                setBaseLocationOptions(data.baseLocations || []);
                setStateOptions(data.states || []);
            })
            .catch((err) => console.error('Failed to fetch locations', err));
    }, [API_CONFIG.APIURL]);

    // --- Handlers ---

    // Handles PO number selection/input
    const handlePoSelection = async (po) => {
        setPoNumber(po);
        // Reset product and asset related states when a new PO is selected/entered
        setProducts([]);
        setAssetType("");
        setRowsByProductIndex({});
        setProductMetaData({});
        setBaseLocation(""); // Reset base location
        setState(""); // Reset state
        setWarranty(""); // Reset warranty
        setLoading(true);

        try {
            const { data } = await axios.get(
                `${API_CONFIG.APIURL}/invoices/po_details/${encodeURIComponent(po)}`
            );

            setAssetCreationAt(data.asset_creation_at || "");

            if (data.asset_creation_at === "invoice" && data.products.length > 0) {
                setAssetType(data.asset_type);
                setProducts(data.products);

                const totalUnits = data.products.reduce((sum, p) => {
                    if (isNaN(p.quantity) || p.quantity < 0) {
                        console.error(`❌ Invalid quantity for product:`, p);
                        return sum;
                    }
                    return sum + p.quantity;
                }, 0);

                if (totalUnits <= 0) {
                    console.error("❌ Total quantity is invalid:", totalUnits);
                    alert("Invalid total quantity. Please check the product quantities.");
                    return;
                }

                const { data: assetIdData } = await axios.get(
                    `${API_CONFIG.APIURL}/invoices/next-asset-ids/${encodeURIComponent(po)}`
                );

                const assetIds = assetIdData.generated_asset_ids;

                if (assetIds.length !== totalUnits) {
                    console.error("❌ Mismatch in asset count:", assetIds.length, totalUnits);
                    alert("Mismatch between total quantity and generated asset IDs.");
                    return;
                }

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
            alert("Failed to fetch PO details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handles Excel file upload for serial numbers
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                    .filter(sn => !!sn);

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
                setExcelFile(file);
                checkForDuplicateSerials(updatedRows); // Check for duplicates after Excel upload

            } catch (err) {
                console.error("Error parsing Excel file:", err);
                alert("Failed to read the Excel file. Please check the format.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Handles changes to product metadata (brand, model)
    const handleMetaChange = (index, field, value) => {
        setProductMetaData((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value,
            },
        }));
    };

    // Handles changes to individual asset rows (e.g., serial number)
    const handleRowChange = (productIndex, rowIndex, field, value) => {
        const updatedRows = { ...rowsByProductIndex };
        updatedRows[productIndex][rowIndex][field] = value;
        setRowsByProductIndex(updatedRows);

        if (field === "serial_no") {
            checkForDuplicateSerials(updatedRows);
        }
    };
    const handlePreview = async (invoiceURL) => {
        try {
            setLoadingPreview(true);
            const response = await axios.get(
                `${API_CONFIG.APIURL}/invoice/get_invoice_pdf/${encodeURIComponent(invoiceURL)}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("resp: invoice pdf: ", response)

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
            setOpenPreview(true);
        } catch (error) {
            console.error("Error loading preview:", error);
            setSnackbar({
                open: true,
                message: "Failed to load preview. Please try again.",
                severity: "error"
            });
        } finally {
            setLoadingPreview(false);
        }
    };

    // Checks for duplicate serial numbers across all products
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

    // Handles PDF invoice file change
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

    // Resets all form fields
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
        setSelectedProductIndex(null); // This line is now valid
        setAssetCreationAt("");
    };

    // --- Form Submission ---
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
        formData.append("invoice", file);
        formData.append("requested_by", requestedBy);

        if (assetCreationAt === "invoice") {
            if (!baseLocation || !state || !Warranty) {
                return setError("Please fill Base Location, State and Warranty.");
            }

            // Re-check for duplicate serial numbers before submission
            const allSerialNumbers = new Set();
            const currentDuplicateSerials = new Set(); // Use a local set for this check

            Object.values(rowsByProductIndex).forEach((rows) => {
                rows.forEach((row) => {
                    const serialNo = row.serial_no?.trim();
                    if (serialNo) { // Only consider non-empty serial numbers
                        if (allSerialNumbers.has(serialNo)) {
                            currentDuplicateSerials.add(serialNo);
                        }
                        allSerialNumbers.add(serialNo);
                    }
                });
            });

            if (currentDuplicateSerials.size > 0) {
                setDuplicateSerials(currentDuplicateSerials); // Update state for UI highlighting
                return setError(`Duplicate serial number(s) found: ${[...currentDuplicateSerials].join(", ")}`);
            }


            formData.append("base_location", baseLocation);
            formData.append("state", state);
            formData.append("Warranty_status", Warranty);
            formData.append("asset_type", assetType);

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
            console.log("formdata: ", formData);
            const response = await axios.post(`${API_CONFIG.APIURL}/invoices/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.message) {
                alert("✅ Invoice uploaded successfully!");
                navigate("/new-assets/purchase-order"); // Redirect on success
                resetForm();
            } else {
                setError(response.data.message || "Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const { message, duplicateSerials: backendDuplicateSerials } = err.response.data;

                if (backendDuplicateSerials?.length > 0) {
                    setDuplicateSerials(new Set(backendDuplicateSerials)); // Set duplicates from backend for UI
                    setError(`❌ Duplicate serial number(s) found: ${backendDuplicateSerials.join(", ")}`);
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

    // --- Render JSX ---
    return (
        <>
            <Navbar />
            <Container maxWidth="md">
                <Card sx={{ mt: 4, p: 3 }}>
                    <CardContent>
                        <Typography variant="h5" textAlign="center" gutterBottom>
                            Edit Uploaded Invoice
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="PO Number"
                                        value={poNumber}
                                        // The onChange for PO Number might need to be an Autocomplete if you want to select existing POs
                                        // For now, it's just a TextField, and `handlePoSelection` is called on value change
                                        onChange={(e) => setPoNumber(e.target.value)}
                                        required
                                        fullWidth
                                        disabled={!!poNum} // Disable if poNum is passed via state (meaning editing specific PO)
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

                            {/* PDF Invoice File Upload */}
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
                                        <Typography variant="body2" color="textSecondary">
                                            Please upload the invoice file (Max 5MB, only PDF)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Example Preview Button (you can move this elsewhere) */}
                            {/* Preview Dialog */}
                            <Dialog open={openPreview} onClose={() => setOpenPreview(false)} fullWidth maxWidth="md">
                                <DialogTitle>
                                    Invoice Preview
                                    <IconButton
                                        aria-label="close"
                                        onClick={() => setOpenPreview(false)}
                                        sx={{ position: "absolute", right: 8, top: 8 }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent dividers>
                                    {loadingPreview ? (
                                        <Typography>Loading preview...</Typography>
                                    ) : (
                                        previewUrl && (
                                            <iframe
                                                src={previewUrl}
                                                title="Invoice PDF Preview"
                                                width="100%"
                                                height="600px"
                                                style={{ border: "none" }}
                                            />
                                        )
                                    )}
                                </DialogContent>
                            </Dialog>
                            {/* Base Location, State, and Warranty (only if products are loaded) */}
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
                                            type="number"
                                        />
                                    </Grid>
                                    <Grid item xs={12} >
                                        {/* Excel File Upload for Serial Numbers */}
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

                            {/* Product-specific fields (Brand, Model, Asset ID, Serial Number) */}
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
                                                    disabled // Asset ID is disabled as it's pre-generated
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

                            {error && (
                                <Typography color="error" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                                    {error}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={loading}
                                    onClick={() => handlePreview(invoiceURL)}
                                >
                                    {loading ? 'Generating Preview...' : 'Preview Old PO'}
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Update Invoice"}
                                </Button>
                               
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default EditInvoice;