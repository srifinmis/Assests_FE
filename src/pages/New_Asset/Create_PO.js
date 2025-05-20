import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  TextField,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../Navbar";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

// Styles
const sectionStyle = {
  p: 3,
  mb: 4,
  boxShadow: 3,
  borderRadius: 2,
  backgroundColor: "#ffffff",
};

const PurchaseOrder = () => {
  // State Variables
  const [loading, setLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [Message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assetTypes, setAssetTypes] = useState([]);
  // const [assetCreationAtPayment, setAssetCreationAtPayment] = useState(true);
  // const [assetCreationAtInvoice, setAssetCreationAtInvoice] = useState(false);
  const [assetCreationOption, setAssetCreationOption] = useState('payment'); // default to "payment"

  const [poDetails, setPoDetails] = useState({
    po_num: "",
    po_date: new Date().toISOString().split("T")[0],
    asset_type: "",
    gst: 0,
  });

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone_num: "",
    client_email: "",
    client_gst_num: "",
    client_address: "",
    vendor_name: "",
    vendor_phone_num: "",
    vendor_email: "",
    vendor_gst_num: "",
    vendor_address: "",
    shipping_name: "",
    shipping_phone_num: "",
    shipping_address: "",
    payment_terms: "",
    delivery_terms: "",
    warranty: "",
  });

  const [lineItems, setLineItems] = useState([
    { asset_name: "", quantity: 1, unit_price: 0 },
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    gstAmount: 0,
    grandTotal: 0,
  });

  // Select Options
  const paymentTermsOptions = ["100% advance along with PO", "50% advance 50% after Delivery",];
  const deliveryTermsOptions = ["3-4 working days after PO", "1 week after the PO",];
  const warrantyTermsOptions = ["as per OEM", "1 year subscription"];

  const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');
  // Initial Fetch
  // 1. Move fetchNextPONumber here
  const fetchNextPONumber = async () => {
  try {
    const res = await axios.get(`${API_CONFIG.APIURL}/CreatePO/next-po-number`);
    setPoDetails((prev) => ({ ...prev, po_num: res.data.po_num }));
  } catch (error) {
    console.error("Failed to fetch PO number:", error);
  }
};

useEffect(() => {
  if (assetCreationOption !== "payment" && assetCreationOption !== "invoice") {
    setAssetCreationOption("payment"); // Default to "payment"
  }
}, [assetCreationOption]);



// 2. Then this useEffect can safely use it
useEffect(() => {
  const fetchAssetTypes = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.APIURL}/CreatePO/asset-types`);
      setAssetTypes(res.data || []);
    } catch (error) {
      console.error("Failed to fetch asset types:", error);
    }
  };

  fetchNextPONumber();
  fetchAssetTypes();
}, []);


  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (poDetails.hasOwnProperty(name)) {
      const updated = { ...poDetails, [name]: value };
      setPoDetails(updated);
      if (name === "gst") {
        calculateTotals(lineItems, updated);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    if (["quantity", "unit_price", "gst"].includes(field)) {
      value = Math.max(0, parseFloat(value) || 0);
    }
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { asset_name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  };

  // Utility Functions
  const calculateTotals = useCallback((items, customPoDetails = poDetails) => {
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.quantity * item.unit_price;
    });

    const gstPercent = parseFloat(customPoDetails.gst) || 0;
    const gstAmount = (subtotal * gstPercent) / 100;
    const grandTotal = subtotal + gstAmount;

    setTotals({ subtotal, gstAmount, grandTotal });
  }, [poDetails]);

  useEffect(() => {
    calculateTotals(lineItems, poDetails);
  }, [lineItems, poDetails, calculateTotals]);

  const validateForm = () => {
    const requiredFields = [
      "client_name", "client_phone_num", "client_email", "client_gst_num", "client_address",
      "vendor_name", "vendor_phone_num", "vendor_email", "vendor_gst_num", "vendor_address",
      "shipping_name", "shipping_phone_num", "shipping_address",
      "payment_terms", "delivery_terms", "warranty"
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the ${field.replace(/_/g, " ")} field.`);
        return false;
      }
    }

    const phoneFields = ["client_phone_num", "vendor_phone_num", "shipping_phone_num"];
    for (let phone of phoneFields) {
      if (formData[phone].length !== 10) {
        alert(`Invalid phone number in ${phone.replace(/_/g, " ")}`);
        return false;
      }
    }

    const emailFields = ["client_email", "vendor_email"];
    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    for (let email of emailFields) {
      if (!emailRegex.test(formData[email])) {
        alert(`Invalid email in ${email.replace(/_/g, " ")}`);
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setPoDetails({
      po_num: "",
      po_date: new Date().toISOString().split("T")[0],
      asset_type: "",
      gst: 0,
    });
    setFormData({
      client_name: "", client_phone_num: "", client_email: "", client_gst_num: "", client_address: "",
      vendor_name: "", vendor_phone_num: "", vendor_email: "", vendor_gst_num: "", vendor_address: "",
      shipping_name: "", shipping_phone_num: "", shipping_address: "",
      payment_terms: "", delivery_terms: "", warranty: "",
    });
    setLineItems([{ asset_name: "", quantity: 1, unit_price: 0 }]);
    setTotals({ subtotal: 0, gstAmount: 0, grandTotal: 0 });
  };
  
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const poData = {
        ...poDetails,
        ...formData,
        line_items: lineItems,
        totals,
        asset_creation: assetCreationOption
      };

      // Use the preview endpoint to get the PDF
      const response = await axios.post(
        `${API_CONFIG.APIURL}/CreatePO/preview`,
        poData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setOpenPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      setError("Failed to generate preview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    setLoading(true);
    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    const requestedBy = loggedInUser.emp_id;
  
    if (!requestedBy) {
      setError("User not logged in. Please log in and try again.");
      setLoading(false);
      return;
    }
  
    const data = {
      ...poDetails,
      ...formData,
      line_items: lineItems,
      totals,
      requested_by: requestedBy,
      asset_creation: assetCreationOption,  
    };
  
    try {
      const response = await axios.post(`${API_CONFIG.APIURL}/CreatePO/request_po`, data);
      if (response.data.success==="true") {
        setMessage({ open: true, text: "PO sent for approval successfully!", severity: "success" });
  
        if (response.data.emailStatus === "sent") {
          setMessage({ open: true, text: "Email sent successfully!", severity: "success" });
        } else {
          setMessage({ open: true, text: "PO sent, but email failed to send.", severity: "warning" });
        }
        resetForm();
        await fetchNextPONumber();  
        setOpenPreview(false);
      } else {
        setMessage({ open: true, text: "Failed to send PO for approval.", severity: "error" });
      }
    } catch (error) {
      console.error("Error sending PO for approval:", error);
      setMessage({ open: true, text: "Error sending PO for approval.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ my: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Purchase Order
        </Typography>

        {/* PO Details Section */}
        <Paper elevation={3} sx={sectionStyle}>
          <Typography variant="h6" gutterBottom>PO Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="PO Number"
                name="po_num"
                fullWidth
                value={poDetails.po_num}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="PO Date"
                name="po_date"
                type="date"
                fullWidth
                value={poDetails.po_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Asset Type"
                name="asset_type"
                fullWidth
                value={poDetails.asset_type}
                onChange={handleChange}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}

              >
                <option value="">Select Asset Type</option>
                {assetTypes.map((type) => (
                  <option key={type.id} value={type.asset_type}>
                    {type.asset_type}
                  </option>
                ))}
              </TextField>
            </Grid>

          </Grid>
        </Paper>

        {/* <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
  <Typography variant="h6" gutterBottom>
    Asset Creation Preference
  </Typography>
  <FormGroup row>
    <FormControlLabel
      control={
        <Checkbox
          checked={createAtPayment}
          onChange={(e) => setCreateAtPayment(e.target.checked)}
        />
      }
      label="Asset creation at payment receipt"
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={createAtInvoice}
          onChange={(e) => setCreateAtInvoice(e.target.checked)}
        />
      }
      label="Asset creation at invoice upload"
    />
  </FormGroup>
</Paper> */}

<Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}>
  <Typography variant="h6" gutterBottom>
    Asset Creation Preference
  </Typography>
  <Divider sx={{ mb: 2 }} />

  <FormControl component="fieldset" fullWidth>
    <RadioGroup
      row
      value={assetCreationOption}
      onChange={(e) => setAssetCreationOption(e.target.value)}
      sx={{ justifyContent: "space-around" }}
    >
      <FormControlLabel
        value="payment"
        control={<Radio sx={{ color: "#1976d2" }} />}
        label="At Payment Receipt"
      />
      <FormControlLabel
        value="invoice"
        control={<Radio sx={{ color: "#1976d2" }} />}
        label="At Invoice Upload"
      />
    </RadioGroup>
  </FormControl>
</Paper>



        {/* Client Details Section */}
        <Paper elevation={3} sx={sectionStyle}>
          <Typography variant="h6" gutterBottom>Client Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Name"
                name="client_name"
                fullWidth
                value={formData.client_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Phone Number"
                name="client_phone_num"
                fullWidth
                value={formData.client_phone_num}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "client_phone_num",
                      value: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
                inputProps={{ inputMode: "numeric", maxLength: 10 }}
                error={formData.client_phone_num.length > 0 && formData.client_phone_num.length < 10}
                helperText={
                  formData.client_phone_num.length > 0 && formData.client_phone_num.length < 10
                    ? "Phone number must be exactly 10 digits."
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Email"
                name="client_email"
                fullWidth
                value={formData.client_email}
                onChange={handleChange}
                error={Boolean(formData.client_email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.client_email))}
                helperText={
                  formData.client_email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.client_email)
                    ? "Enter a valid email address."
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client GST Number"
                name="client_gst_num"
                fullWidth
                value={formData.client_gst_num}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Client Address"
                name="client_address"
                fullWidth
                multiline
                rows={3}
                value={formData.client_address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Vendor Details Section */}
        <Paper elevation={3} sx={sectionStyle}>
        <Typography variant="h6" gutterBottom>Vendor Details</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vendor Name"
              name="vendor_name"
              fullWidth
              value={formData.vendor_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vendor Phone Number"
              name="vendor_phone_num"
              fullWidth
              value={formData.vendor_phone_num}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "vendor_phone_num",
                    value: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              error={formData.vendor_phone_num.length > 0 && formData.vendor_phone_num.length < 10}
              helperText={
                formData.vendor_phone_num.length > 0 && formData.vendor_phone_num.length < 10
                  ? "Phone number must be exactly 10 digits."
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vendor Email"
              name="vendor_email"
              fullWidth
              value={formData.vendor_email}
              onChange={handleChange}
              error={Boolean(formData.vendor_email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.vendor_email))}
              helperText={
                formData.vendor_email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.vendor_email)
                  ? "Enter a valid email address."
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vendor GST Number"
              name="vendor_gst_num"
              fullWidth
              value={formData.vendor_gst_num}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Vendor Address"
              name="vendor_address"
              fullWidth
              multiline
              rows={3}
              value={formData.vendor_address}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        </Paper>

        {/* Shipping Details Section */}
        <Paper elevation={3} sx={sectionStyle}>
        <Typography variant="h6" gutterBottom>Shipping Details</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Shipping Name"
              name="shipping_name"
              fullWidth
              value={formData.shipping_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Shipping Phone Number"
              name="shipping_phone_num"
              fullWidth
              value={formData.shipping_phone_num}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "shipping_phone_num",
                    value: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              error={formData.shipping_phone_num.length > 0 && formData.shipping_phone_num.length < 10}
              helperText={
                formData.shipping_phone_num.length > 0 && formData.shipping_phone_num.length < 10
                  ? "Phone number must be exactly 10 digits."
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Shipping Address"
              name="shipping_address"
              fullWidth
              multiline
              rows={3}
              value={formData.shipping_address}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        </Paper>

        {/* Line Items */}
        <Paper elevation={3} sx={sectionStyle}>
          <Typography variant="h6" gutterBottom>Product Value</Typography>
          <Divider sx={{ mb: 2 }} />
          {lineItems.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={5}><TextField label="Asset Name" fullWidth value={item.asset_name} onChange={(e) => handleLineItemChange(index, "asset_name", e.target.value)} /></Grid>
              <Grid item xs={12} sm={2}><TextField label="Quantity" type="number" fullWidth value={item.quantity} onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)} /></Grid>
              <Grid item xs={12} sm={2}><TextField label="Unit Price" type="number" fullWidth value={item.unit_price} onChange={(e) => handleLineItemChange(index, "unit_price", e.target.value)} /></Grid>
              <Grid item xs={12} sm={2}><Typography variant="body1" sx={{ mt: 2 }}>   ₹ {((item.quantity * item.unit_price))}</Typography></Grid>
              <Grid item xs={12} sm={1}> <IconButton color="error" onClick={() => removeLineItem(index)}><DeleteIcon/></IconButton> </Grid>
            </Grid>
          ))}
          
          <Button variant="outlined" onClick={addLineItem}>+ Add Item</Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">Subtotal: ₹{totals.subtotal}</Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="GST (%)"
                type="number"
                fullWidth
                value={poDetails.gst || 0}
                name="gst"
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                  handleChange({ target: { name: "gst", value: val } });
                }}
                helperText={poDetails.gst > 100 ? "GST cannot exceed 100%" : ""}
                error={poDetails.gst > 100}
              />
            </Grid>
          </Grid>

          <Typography variant="body1">GST: ₹{totals.gstAmount}</Typography>
          <Typography variant="h6">Grand Total: ₹{Math.round(totals.grandTotal)}</Typography>
        </Paper>

        {/* Terms & Conditions */}
        <Paper elevation={3} sx={sectionStyle}>
          <Typography variant="h6" gutterBottom> Terms & Conditions</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
          <Autocomplete
            freeSolo
            options={paymentTermsOptions}
            value={formData.payment_terms}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                payment_terms: newValue || "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Payment Terms"
                name="payment_terms"
                fullWidth
                onChange={handleChange}
              />
            )}
          />
          </Grid>
          <Grid item xs={12} sm={4}>
          <Autocomplete
            freeSolo
            options={deliveryTermsOptions}
            value={formData.delivery_terms}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                delivery_terms: newValue || "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Delivery Terms"
                name="delivery_terms"
                fullWidth
                onChange={handleChange}
              />
            )}
          />
          </Grid>
          <Grid item xs={12} sm={4}>
          <Autocomplete
            freeSolo
            options={warrantyTermsOptions}
            value={formData.warranty}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                warranty: newValue || "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Warranty"
                name="warranty"
                fullWidth
                onChange={handleChange}
              />
            )}
          />
          </Grid>
          </Grid>
        </Paper>

        {/* Generate Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2,  mt: 4, width: "100%" }}> {/*justifyContent: "center", */}
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleGeneratePreview}
            sx={{ width: { xs: "100%", sm: "auto" }, maxWidth: "200px" }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Generating PO...
              </>
            ) : (
              "Generate PO"
            )}
          </Button>
        </Box>

        {/* Dialog for Preview */} 
        <Dialog
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle>
            PO Preview
            <IconButton
              onClick={() => setOpenPreview(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, height: 'calc(100% - 120px)' }}>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                title="PO Preview"
                style={{ border: 'none' }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setOpenPreview(false)} color="primary">
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleApproval}
              sx={{ width: { xs: "100%", sm: "auto" }, maxWidth: "200px" }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Sending for Approval...
                </>
              ) : (
                "SEND FOR APPROVAL"
              )}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
};

export default PurchaseOrder;
