import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import Navbar from '../Navbar';
import { useLocation, useNavigate } from "react-router-dom";

const AssignToCustomer = () => {
    const [formData, setFormData] = useState({
        customerID: '',
        loanApplicationNo: '',
        instakitNo: '',
        issuedDate: '',
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState('');
    const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');


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

        const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
        const requestedBya = loggedInUser.emp_id;

        // Construct payload manually to include updated requestedBy
        const payload = {
            ...formData,
            requestedBy: requestedBya
        };

        try {
            console.log("API Payload: ", payload);
            const response = await axios.post(`${API_CONFIG.APIURL}/bo/createcustomer`, payload);
            alert('✅ Assigned successfully');
            navigate("/bo-user/customerMain")
            setSubmitStatus('✅ Assigned successfully');
            console.log(response.data);

            setFormData({
                customerID: '',
                loanApplicationNo: '',
                instakitNo: '',
                issuedDate: '',
                requestedBy: ''
            });
            setErrors({});
        } catch (error) {
            setSubmitStatus(`❌ Failed to assign, ${error?.response?.data?.message || error.message}`);
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
                <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    Assign to Customer
                </Typography>

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
                        <Button type="submit" variant="contained" fullWidth>
                            Submit
                        </Button>
                    </Grid>

                    {submitStatus && (
                        <Grid item xs={12}>
                            <Alert severity={submitStatus.includes('✅') ? 'success' : 'error'}>
                                {submitStatus}
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            </form>
        </>
    );
};

export default AssignToCustomer;
