import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "../Navbar";
import { format } from 'date-fns';

const EditPO = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const poNum = location.state?.po_number;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assetTypes, setAssetTypes] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [poData, setPoData] = useState({
    po_date: new Date().toISOString().split('T')[0],
    asset_type: '',
    asset_creation_at: '',
    client_name: '',
    client_email: '',
    client_gst_num: '',
    client_phone_num: '',
    client_address: '',
    vendor_name: '',
    vendor_phone_num: '',
    vendor_email: '',
    vendor_gst_num: '',
    vendor_address: '',
    shipping_name: '',
    shipping_phone_num: '',
    shipping_address: '',
    delivery_terms: '',
    payment_terms: '',
    warranty: '',
    gst: 18,
    line_items: [],
    totals: {
      subtotal: 0,
      gstAmount: 0,
      grandTotal: 0
    }
  });
  const [openPreview, setOpenPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [assetCreationOption, setAssetCreationOption] = useState('payment');
  const [showGstError, setShowGstError] = useState(false);

  // Select Options
  const paymentTermsOptions = ["100% advance along with PO", "50% advance 50% after Delivery"];
  const deliveryTermsOptions = ["3-4 working days after PO", "1 week after the PO"];
  const warrantyTermsOptions = ["as per OEM", "1 year subscription"];

  const { API_CONFIG } = require('../../configuration');

  useEffect(() => {
    const fetchAssetTypes = async () => {
      try {
        const res = await axios.get(`${API_CONFIG.APIURL}/CreatePO/asset-types`);
        setAssetTypes(res.data || []);
      } catch (error) {
        console.error("Failed to fetch asset types:", error);
      }
    };

    fetchAssetTypes();
  }, []);

  const hasChanges = () => {
    if (!originalData) return false;

    // Compare all relevant fields
    const fieldsToCompare = [
      'po_date', 'asset_type', 'asset_creation_at', 'client_name', 'client_email',
      'client_gst_num', 'client_phone_num', 'client_address', 'vendor_name',
      'vendor_phone_num', 'vendor_email', 'vendor_gst_num', 'vendor_address',
      'shipping_name', 'shipping_phone_num', 'shipping_address', 'delivery_terms',
      'payment_terms', 'warranty', 'cgst', 'sgst'
    ];

    // Check if any field has changed
    for (const field of fieldsToCompare) {
      if (poData[field] !== originalData[field]) {
        return true;
      }
    }

    // Compare line items
    if (poData.line_items.length !== originalData.line_items.length) {
      return true;
    }

    for (let i = 0; i < poData.line_items.length; i++) {
      const currentItem = poData.line_items[i];
      const originalItem = originalData.line_items[i];

      if (!originalItem) return true;

      if (currentItem.asset_name !== originalItem.asset_name ||
        currentItem.quantity !== originalItem.quantity ||
        currentItem.unit_price !== originalItem.unit_price) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const fetchPODetails = async () => {
      if (!poNum) {
        setError('No PO number provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching PO details for:', poNum);
        const response = await axios.get(`${API_CONFIG.APIURL}/edit-po/${poNum}`);
        console.log('API Response:', response.data);

        if (!response.data || !response.data.po_details) {
          throw new Error('No PO details found');
        }

        const { po_details, products } = response.data;

        const formattedDate = po_details.po_date
          ? new Date(po_details.po_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        const firstProduct = products[0] || {};
        const cgst = parseFloat(firstProduct.cgst || 0);
        const sgst = parseFloat(firstProduct.sgst || 0);
        console.log("GST's:", cgst, sgst);

        const gst = cgst + sgst;
        const subtotal = products.reduce((sum, product) =>
          sum + (product.quantity * product.unit_price), 0);


        const gstAmount = gst ? (subtotal * gst) / 100 : 0;

        setAssetCreationOption(po_details.asset_creation_at || 'payment');

        // const halfGst = gst / 2;

        const newPoData = {
          ...po_details,
          po_date: formattedDate,
          cgst,
          sgst,
          gst: gst,
          line_items: products.map(product => ({
            asset_name: product.item_description,
            quantity: product.quantity,
            unit_price: product.unit_price
          })),
          totals: {
            subtotal,
            gstAmount,
            grandTotal: subtotal + gstAmount
          }
        };

        setPoData(newPoData);
        setOriginalData(newPoData);
      } catch (err) {
        console.error('Error fetching PO details:', err);
        setError('Failed to fetch PO details. Please try again.');
        setTimeout(() => {
          navigate('/new-assets/po-main');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchPODetails();
  }, [poNum, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gst') {
      const newValue = Math.max(0, Math.min(100, parseFloat(value) || 0));

      const subtotal = poData.line_items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0
      );
      const gstAmount = (subtotal * newValue) / 100;

      setPoData(prev => ({
        ...prev,
        [name]: newValue,
        gst: newValue,
        totals: {
          subtotal,
          gstAmount,
          grandTotal: subtotal + gstAmount
        }
      }));

      setShowGstError(false);
    } else {
      setPoData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (e) => {
    setPoData(prev => ({
      ...prev,
      po_date: e.target.value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...poData.line_items];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    };

    // Recalculate totals
    const subtotal = newLineItems.reduce((sum, item) =>
      sum + (item.quantity || 0) * (item.unit_price || 0), 0);

    // Only calculate GST if a value is provided
    const gstAmount = poData.gst ? (subtotal * poData.gst) / 100 : 0;

    setPoData(prev => ({
      ...prev,
      line_items: newLineItems,
      totals: {
        subtotal: subtotal,
        gstAmount: gstAmount,
        grandTotal: subtotal + gstAmount
      }
    }));
  };

  const addLineItem = () => {
    setPoData(prev => {
      const newLineItems = [
        ...prev.line_items,
        { asset_name: '', quantity: 1, unit_price: 0 }
      ];

      // Recalculate totals with new line item
      const subtotal = newLineItems.reduce((sum, item) =>
        sum + (item.quantity || 0) * (item.unit_price || 0), 0);

      // Only calculate GST if a value is provided
      const gstAmount = prev.gst ? (subtotal * prev.gst) / 100 : 0;

      return {
        ...prev,
        line_items: newLineItems,
        totals: {
          subtotal: subtotal,
          gstAmount: gstAmount,
          grandTotal: subtotal + gstAmount
        }
      };
    });
  };

  const removeLineItem = (index) => {
    setPoData(prev => {
      const newLineItems = prev.line_items.filter((_, i) => i !== index);

      // Recalculate totals after removing line item
      const subtotal = newLineItems.reduce((sum, item) =>
        sum + (item.quantity || 0) * (item.unit_price || 0), 0);

      // Only calculate GST if a value is provided
      const gstAmount = prev.gst ? (subtotal * prev.gst) / 100 : 0;

      return {
        ...prev,
        line_items: newLineItems,
        totals: {
          subtotal: subtotal,
          gstAmount: gstAmount,
          grandTotal: subtotal + gstAmount
        }
      };
    });
  };

  const validateForm = () => {
    if (!poData.gst && poData.gst !== 0) {
      setShowGstError(true);
      setError('GST field is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // First generate the new PO PDF
      const previewResponse = await axios.post(
        `${API_CONFIG.APIURL}/CreatePO/preview`,
        poData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
      const requestedBy = loggedInUser.emp_id;

      // Create FormData to send both PO data and PDF
      const formData = new FormData();
      formData.append('po_data', JSON.stringify({
        ...poData,
        asset_creation_at: assetCreationOption,
        updated_by: requestedBy
      }));
      console.log("poData", poData);
      // Append the PDF blob
      const pdfBlob = new Blob([previewResponse.data], { type: 'application/pdf' });
      formData.append('po_pdf', pdfBlob, `${poNum}.pdf`);

      // Update PO with new PDF
      await axios.put(`${API_CONFIG.APIURL}/edit-po/${poNum}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('PO updated successfully');
      setTimeout(() => {
        window.location.href = '/new-assets/purchase-order';
      }, 1000);
    } catch (err) {
      console.error('Error updating PO:', err);
      setError('Failed to update PO');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

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

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setOpenPreview(true);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debug log for render
  console.log('Current state:', { loading, error, poData });

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Edit Purchase Order
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="h6" color="error">
                {error}
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                {/* PO Number Display */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      PO Number: {poNum}
                    </Typography>
                  </Paper>
                </Grid>

                {/* PO Details */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      PO Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="PO Date"
                          type="date"
                          name="po_date"
                          value={poData.po_date}
                          onChange={handleDateChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          options={assetTypes}
                          getOptionLabel={(option) => option.asset_type || ''}
                          value={assetTypes.find(type => type.asset_type === poData.asset_type) || null}
                          onChange={(event, newValue) => {
                            handleInputChange({
                              target: {
                                name: 'asset_type',
                                value: newValue ? newValue.asset_type : ''
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Asset Type"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Asset Creation Preference */}
                <Grid item xs={12}>
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
                </Grid>

                {/* Client Information */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      Client Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Client Name"
                          name="client_name"
                          value={poData.client_name}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Client Email"
                          name="client_email"
                          value={poData.client_email}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Client GST Number"
                          name="client_gst_num"
                          value={poData.client_gst_num}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Client Phone"
                          name="client_phone_num"
                          value={poData.client_phone_num}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Client Address"
                          name="client_address"
                          value={poData.client_address}
                          onChange={handleInputChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Vendor Information */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      Vendor Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor Name"
                          name="vendor_name"
                          value={poData.vendor_name}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor Email"
                          name="vendor_email"
                          value={poData.vendor_email}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor GST Number"
                          name="vendor_gst_num"
                          value={poData.vendor_gst_num}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor Phone"
                          name="vendor_phone_num"
                          value={poData.vendor_phone_num}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Vendor Address"
                          name="vendor_address"
                          value={poData.vendor_address}
                          onChange={handleInputChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Shipping Information */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      Shipping Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Shipping Name"
                          name="shipping_name"
                          value={poData.shipping_name}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Shipping Phone"
                          name="shipping_phone_num"
                          value={poData.shipping_phone_num}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Shipping Address"
                          name="shipping_address"
                          value={poData.shipping_address}
                          onChange={handleInputChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Terms and Conditions */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "#f9f9f9" }}>
                    <Typography variant="h6" gutterBottom>
                      Terms and Conditions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          freeSolo
                          options={deliveryTermsOptions}
                          value={poData.delivery_terms}
                          onChange={(event, newValue) => {
                            handleInputChange({
                              target: {
                                name: 'delivery_terms',
                                value: newValue || ''
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Delivery Terms"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          freeSolo
                          options={paymentTermsOptions}
                          value={poData.payment_terms}
                          onChange={(event, newValue) => {
                            handleInputChange({
                              target: {
                                name: 'payment_terms',
                                value: newValue || ''
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Payment Terms"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          freeSolo
                          options={warrantyTermsOptions}
                          value={poData.warranty}
                          onChange={(event, newValue) => {
                            handleInputChange({
                              target: {
                                name: 'warranty',
                                value: newValue || ''
                              }
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Warranty"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Line Items */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Product Value</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {poData.line_items.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5}>
                              <TextField
                                label="Asset Name"
                                fullWidth
                                value={item.asset_name}
                                onChange={(e) => handleLineItemChange(index, 'asset_name', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField
                                label="Unit Price"
                                type="number"
                                fullWidth
                                value={item.unit_price}
                                onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Typography variant="body1" sx={{ mt: 2 }}>
                                ₹ {((item.quantity * item.unit_price)).toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton color="error" onClick={() => removeLineItem(index)}>
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>

                    <Button variant="outlined" onClick={addLineItem} sx={{ mt: 2 }}>
                      + Add Item
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="GST (%)"
                          type="number"
                          fullWidth
                          required
                          value={poData.gst || ''}
                          name="gst"
                          onChange={handleInputChange}
                          helperText={poData.gst > 100 ? "GST cannot exceed 100%" : (showGstError ? "GST is required" : "")}
                          error={poData.gst > 100 || (showGstError && !poData.gst && poData.gst !== 0)}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">Subtotal: ₹{poData.totals.subtotal.toFixed(2)}</Typography>
                      <Typography variant="body1">GST: ₹{poData.totals.gstAmount.toFixed(2)}</Typography>
                      <Typography variant="h6">Grand Total: ₹{poData.totals.grandTotal.toFixed(2)}</Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={loading || !hasChanges()}
                      onClick={handleGeneratePreview}
                    >
                      {loading ? 'Generating Preview...' : 'Preview PO'}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || !hasChanges()}
                    >
                      {loading ? 'Updating...' : 'Update PO'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Preview Dialog */}
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
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenPreview(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Error and Success Messages */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError('')}
          >
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess('')}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </>
  );
};

export default EditPO;