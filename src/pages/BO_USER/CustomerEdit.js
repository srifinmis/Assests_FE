
import React, { useState, useEffect } from "react";
import { message } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Grid, TextField, Typography, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Navbar from '../Navbar';

const CustomerEdit = () => {
    const [formData, setFormData] = useState({
        customerID: '',
        loanApplicationNo: '',
        instakitNo: '',
        issuedDate: '',
    });

    const [initialFormData, setInitialFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState('');
    const { API_CONFIG } = require('../../configuration');

    const location = useLocation();
    const docket_id = location.state?.docket_id;
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const requestedBy = loggedInUser.emp_id;

    useEffect(() => {
        const fetchCustomerData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_CONFIG.APIURL}/bo/customer/byid`, {
                    params: { docket_id: docket_id }
                });

                if (Array.isArray(response.data?.data) && response.data.data.length > 0) {
                    const customer = response.data.data[0];
                    const fetchedData = {
                        customerID: customer.customer_id || '',
                        loanApplicationNo: customer.loan_app_no || '',
                        instakitNo: customer.docket_id || '',
                        issuedDate: customer.issue_date || '',
                    };
                    setFormData(fetchedData);
                    setInitialFormData(fetchedData); // Store initial data
                } else {
                    message.error("Invalid response format from server.");
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
                message.error("Error fetching customer details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [docket_id]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (!value.trim()) {
                newErrors[key] = 'This field is required';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('');

        if (!validateForm()) return;

        const payload = {
            ...formData,
            requestedBy,
            docketId: docket_id
        };

        try {
            const response = await axios.post(`${API_CONFIG.APIURL}/bo/updatecustomer`, payload);
            toast.success("✅Customer Updated successfully");
            alert("✅Customer Updated successfully");
            navigate("/bo-user/customerMain")
        } catch (error) {
            console.error(error);
            toast.error(`❌ Failed to update: ${error?.response?.data?.message || error.message}`);
            setSubmitStatus(`❌ Failed to update: ${error?.response?.data?.message || error.message}`);
        }
    };

    const isFormModified = () => {
        return Object.keys(formData).some(key => formData[key] !== initialFormData[key]);
    };

    return (
        <>
            <Navbar />
            <ToastContainer />
            <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
                <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    Edit Customer
                </Typography>

                {loading ? (
                    <Grid container justifyContent="center">
                        <CircularProgress />
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Customer ID"
                                name="customerID"
                                fullWidth
                                value={formData.customerID}
                                onChange={handleChange}
                                error={!!errors.customerID}
                                helperText={errors.customerID}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Loan Application No"
                                name="loanApplicationNo"
                                fullWidth
                                value={formData.loanApplicationNo}
                                onChange={handleChange}
                                error={!!errors.loanApplicationNo}
                                helperText={errors.loanApplicationNo}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Instakit No"
                                name="instakitNo"
                                fullWidth
                                value={formData.instakitNo}
                                onChange={handleChange}
                                error={!!errors.instakitNo}
                                helperText={errors.instakitNo}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Issued Date"
                                name="issuedDate"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.issuedDate}
                                onChange={handleChange}
                                error={!!errors.issuedDate}
                                helperText={errors.issuedDate}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={!isFormModified()} // Disable if no field is modified
                            >
                                Update
                            </Button>
                        </Grid>

                        {submitStatus && (
                            <Grid item xs={12}>
                                <Typography align="center" color="secondary">
                                    {submitStatus}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </form>
        </>
    );
};

export default CustomerEdit;
