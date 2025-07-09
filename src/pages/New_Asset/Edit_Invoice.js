import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
    Container, TextField, Button,
    Typography, Card, Tooltip,
    CardContent, Box,
    Autocomplete, Grid, Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
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
    const [file, setFile] = useState(null);
    const [baseLocation, setBaseLocation] = useState("");
    const [state, setState] = useState("");
    const [Warranty, setWarranty] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [imeinumber, setIMEINum] = useState("");

    const [excelFile, setExcelFile] = useState(null);
    const [baseLocationOptions, setBaseLocationOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [poOptions, setPoOptions] = useState([]);
    const [products, setProducts] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [openPreview, setOpenPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [assetType, setAssetType] = useState("");
    const [rowsByProductIndex, setRowsByProductIndex] = useState({});
    const [productMetaData, setProductMetaData] = useState({});
    const [productLocations, setProductLocations] = useState({});

    const [assetCreationAt, setAssetCreationAt] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [duplicateSerials, setDuplicateSerials] = useState(new Set());
    const [invoice, setInvoice] = useState([]);
    const [selectedProductIndex, setSelectedProductIndex] = useState(null);
    const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

    // Add a state to control showing the upload field
    const [showUploadField, setShowUploadField] = useState(true);

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
                    setInvoice(res.data);
                    console.log("res api flag: ", res.data);

                    if (res.data) {
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
                            // if (assetMaster && assetMaster.length > 0) {
                            //     const assetSample = assetMaster[0];
                            //     console.log("assetsample: ", assetSample)
                            //     setBaseLocation(assetSample.base_location || "");
                            //     setState(assetSample.state || "");
                            //     setWarranty(assetSample.warranty_status || "");
                            //     console.log("warrenty: ", assetSample.warranty_status)
                            //     // console.log('Brand: ',assetSample.brand)
                            //     setBrand(assetSample.brand || '')
                            //     // console.log('Model: ',assetSample.model)
                            //     setModel(assetSample.model || '')
                            //     // console.log('Imei_Num: ',assetSample.imei_num)
                            //     // setIMEINum(assetSample.imei_num || '')
                            // } else {
                            //     setBaseLocation("");
                            //     setState("");
                            //     setWarranty("");
                            // }

                            // Prepare serial numbers and product metadata from assetMaster array
                            if (assetMaster && assetMaster.length > 0) {
                                const newRowsByProductIndex = {};
                                const newProductMetaData = {};
                                const newProductLocations = {};

                                assetMaster.forEach((asset, index) => {
                                    const productIndex = asset.product_index ?? asset.productIndex ?? index;

                                    // Initialize group
                                    if (!newRowsByProductIndex[productIndex]) {
                                        newRowsByProductIndex[productIndex] = [];
                                    }

                                    newRowsByProductIndex[productIndex].push({
                                        asset_id: asset.asset_id,
                                        imei_num: asset.imei_num || "",
                                        productIndex,
                                    });

                                    if (!newProductMetaData[productIndex]) {
                                        newProductMetaData[productIndex] = {
                                            brand: asset.brand || "",
                                            model: asset.model || "",
                                        };
                                    }

                                    if (!newProductLocations[productIndex]) {
                                        newProductLocations[productIndex] = {
                                            base_location: asset.base_location || "",
                                            state: asset.state || "",
                                            warranty_status: asset.warranty_status || "",
                                        };
                                    }
                                });

                                console.log("✅ Rows by Product Index:", newRowsByProductIndex);
                                console.log("📦 Product MetaData:", newProductMetaData);
                                console.log("📍 Product Locations:", newProductLocations);
                                setWarranty(newProductLocations[0].warranty_status)
                                console.log('warranty_status: ', newProductLocations[0].warranty_status)
                                setRowsByProductIndex(newRowsByProductIndex);
                                setProductMetaData(newProductMetaData);
                                setProductLocations(newProductLocations); // If you have a state for this
                                checkForDuplicateSerials(newRowsByProductIndex);
                            }
                        }
                    }
                })
                .catch((err) => console.error("❌ Error fetching invoice data:", err));
        }
    }, [poNum, API_CONFIG.APIURL]); // Dependency array: re-run if poNum or API_CONFIG.APIURL changes

    console.log('row by product index: ', rowsByProductIndex)
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

                console.log('handle po select: ', data.products)
                data.products.forEach((product, index) => {
                    const rows = [];
                    for (let j = 0; j < product.quantity; j++) {
                        rows.push({
                            asset_id: rowsByProductIndex.asset_id,
                            imei_num: rowsByProductIndex.imei_num || "",
                            productIndex: index,
                        });
                    }
                    initialRows[index] = rows;
                });
                console.log('initialRows: ', initialRows)
                // setRowsByProductIndex(initialRows);
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
                    .map(row => row.imei_num?.toString().trim())
                    .filter(sn => !!sn);

                const updatedRows = { ...rowsByProductIndex };
                let serialIndex = 0;

                Object.keys(updatedRows).forEach((productIndex) => {
                    updatedRows[productIndex] = updatedRows[productIndex].map((row) => {
                        const imei_num = serialNumbers[serialIndex] || "";
                        serialIndex++;
                        return { ...row, imei_num };
                    });
                });

                // setRowsByProductIndex(updatedRows);
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
        console.log('handlerowchanges: ', updatedRows)
        setRowsByProductIndex(updatedRows);

        if (field === "imei_num") {
            checkForDuplicateSerials(updatedRows);
        }
    };
    // console.log('asset details: ',rowsByProductIndex)
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
                const sn = row.imei_num?.trim();
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
        if (selectedFile) {
            setFile(selectedFile);
            const preview = URL.createObjectURL(selectedFile);
            setPreviewUrl(preview);
            setOpenPreview(true);
            setShowUploadField(false);
        }
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
    const handleProductLocationChange = (index, field, value) => {
        const updated = [...productLocations];
        if (!updated[index]) updated[index] = {};
        updated[index][field] = value;
        setProductLocations(updated);
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Basic validation
        // if (!poNumber || !invoiceNumber || !invoiceDate || !file) {
        //     return setError("Please fill out all required fields and upload a file.");
        // }

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
            // if (!file) {
            //     return setError("Please upload the invoice file.");
            // }

            // Check for duplicate serial numbers
            const allSerialNumbers = new Set();
            const currentDuplicateSerials = new Set();

            Object.values(rowsByProductIndex).forEach((rows) => {
                rows.forEach((row) => {
                    const serialNo = row.imei_num?.trim();
                    if (serialNo) {
                        if (allSerialNumbers.has(serialNo)) {
                            currentDuplicateSerials.add(serialNo);
                        }
                        allSerialNumbers.add(serialNo);
                    }
                });
            });

            if (currentDuplicateSerials.size > 0) {
                setDuplicateSerials(currentDuplicateSerials);
                return setError(`Duplicate serial number(s) found: ${[...currentDuplicateSerials].join(", ")}`);
            }

            // Prepare asset data
            const assetData = [];

            products.forEach((product, index) => {
                const brand = productMetaData[index]?.brand || "";
                const model = productMetaData[index]?.model || "";
                const location = productLocations[index] || {}; // safely handle missing index
                const rows = rowsByProductIndex[index] || [];   // asset rows for this product

                rows.forEach((row) => {
                    assetData.push({
                        asset_id: row.asset_id,
                        imei_num: row.imei_num,
                        brand: brand,
                        model: model,
                        product_index: index,
                        base_location: location.base_location || "",
                        state: location.state || "",
                        warranty_status: location.warranty_status || ""
                    });
                });
            });

            formData.append("assetData", JSON.stringify(assetData));

        }
        try {
            setLoading(true);
            console.log("formdata update API call : ", formData);
            const response = await axios.post(`${API_CONFIG.APIURL}/invoices/invoice-update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.message) {
                alert("✅ Invoice Updated successfully!");
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

    // When loading from server, if invoiceURL is set, also set showUploadField to false
    useEffect(() => {
        if (invoiceURL) {
            setShowUploadField(false);
        }
    }, [invoiceURL]);

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
                                        onChange={(e) => setPoNumber(e.target.value)}
                                        required
                                        fullWidth
                                        disabled={!!poNum}
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
                                sx={{
                                    border: "2px dashed #1976d2",
                                    borderRadius: 2,
                                    p: 3,
                                    mb: 2,
                                    textAlign: "center",
                                    backgroundColor: "#f5f5f5",
                                    cursor: showUploadField ? "pointer" : "default",
                                    position: "relative"
                                }}
                                onClick={() => {
                                    if (showUploadField) document.getElementById("fileInput").click();
                                }}
                            >
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="application/pdf"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                {(!showUploadField && (file || invoiceURL)) ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" position="relative">
                                        <InsertDriveFileIcon sx={{ fontSize: 40, color: "#1976d2", cursor: "pointer" }} onClick={() => handlePreview(invoiceURL || previewUrl)} />
                                        <Typography sx={{ ml: 2, cursor: "pointer" }} onClick={() => handlePreview(invoiceURL || previewUrl)}>
                                            {file ? file.name : invoiceURL}
                                        </Typography>
                                        <Tooltip title="Remove file">
                                            <IconButton
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    setinvoiceURL("");
                                                    setShowUploadField(true);
                                                    setPreviewUrl("");
                                                }}
                                                sx={{ ml: 2 }}
                                            >
                                                <CloseIcon color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ) : (
                                    showUploadField && (
                                        <Box>
                                            <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                                            <Typography>Click or Drag PDF file here</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Please upload the invoice file (Max 5MB, only PDF)
                                            </Typography>
                                        </Box>
                                    )
                                )}
                            </Box>

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
                            {products.map((product, i) => (
                                <Grid container spacing={2} key={i} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            freeSolo
                                            options={baseLocationOptions}
                                            value={productLocations[i]?.base_location || ''}
                                            onChange={(e) => setBaseLocation(e.target.value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Base Location"
                                                    required
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            freeSolo
                                            options={stateOptions}
                                            value={productLocations[i]?.state || ""}
                                            onChange={(e) => setState(e.target.value)}
                                            // onChange={(e, newValue) => setState(newValue || '')}
                                            // onInputChange={(e, newInputValue) => setState(newInputValue)}
                                            renderInput={(params) => (
                                                // <TextField {...params} label="State" required fullWidth />
                                                <TextField
                                                    {...params}
                                                    label="State"
                                                // value={productLocations[i]?.state || ""}
                                                // disabled
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Warranty"
                                            value={Warranty || ''}
                                            onChange={(e) => setWarranty( e.target.value)}
                                            // onChange={(e, newValue) => setWarranty(newValue || '')}
                                            // onInputChange={(e, newInputValue) => setWarranty(newInputValue)}

                                            required
                                            fullWidth
                                            type="number"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            onClick={() => !excelFile && document.getElementById("excelInput").click()}
                                            sx={{
                                                border: "2px dashed #1976d2",
                                                borderRadius: 2,
                                                p: 3,
                                                mb: 2,
                                                textAlign: "center",
                                                backgroundColor: "#f5f5f5",
                                                cursor: "pointer",
                                                position: "relative"
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
                                                <Box display="flex" justifyContent="center" alignItems="center" position="relative">
                                                    <InsertDriveFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                                                    <Typography sx={{ ml: 2 }}>{excelFile.name}</Typography>
                                                    <Tooltip title="Remove file">
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // prevent re-triggering upload
                                                                setExcelFile(null);  // clear file from state
                                                                document.getElementById("excelInput").value = null; // reset input value
                                                            }}
                                                            sx={{ ml: 2 }}
                                                        >
                                                            <DeleteIcon color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                                                    <Typography>Click or Drag Excel file here</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Please upload the Excel file for serial numbers (Max 5MB, only .xlsx/.xls)
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            ))}

                            {products.map((product, i) => (
                                <Box key={i} sx={{ mb: 3, border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {product.asset_type} - {product.item_description} ({product.quantity} units)
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mb: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Brand"
                                                value={productMetaData[i]?.brand || ''}
                                                onChange={(e) => handleMetaChange(i, "brand", e.target.value)}
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Model"
                                                value={productMetaData[i]?.model || ''}
                                                onChange={(e) => handleMetaChange(i, "model", e.target.value)}
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>

                                    {Object.keys(rowsByProductIndex).map((productIndex) =>
                                        rowsByProductIndex[productIndex]?.map((row, i) => (
                                            <Grid container spacing={2} key={1} sx={{ mb: 1 }}>
                                                <Grid item xs={12} sm={3}>
                                                    <TextField
                                                        label="Asset ID"
                                                        value={row.asset_id || ''}
                                                        disabled // Asset ID is disabled as it's pre-generated
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={9}>
                                                    <TextField
                                                        label="Serial Number"
                                                        value={row.imei_num} // <--- This is the key line
                                                        onChange={(e) =>
                                                            handleRowChange(productIndex, i, "imei_num", e.target.value)
                                                        }
                                                        required
                                                        fullWidth
                                                        error={duplicateSerials.has((row.imei_num || "").trim())}
                                                        helperText={
                                                            duplicateSerials.has((row.imei_num || "").trim())
                                                                ? "Duplicate serial number"
                                                                : ""
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        )))}
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
                                    onClick={() => handlePreview(invoiceURL || previewUrl)}
                                >
                                    {loading ? 'Generating Preview...' : 'Preview Old Invoice'}
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
