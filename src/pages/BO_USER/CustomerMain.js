

// import React, { useState, useEffect } from "react";
// import { Table, Spin, message, Button, Input, Select, Tag } from "antd";
// import { EditOutlined, UploadOutlined } from '@ant-design/icons';
// import { Box, IconButton, CircularProgress, Hidden } from "@mui/material";
// import Navbar from "../Navbar";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import { API_CONFIG } from '../../configuration';

// const { Option } = Select;

// const CustomerMain = () => {
//     const [purchaseOrders, setPurchaseOrders] = useState([]);
//     const [invoiceData, setInvoiceData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchText, setSearchText] = useState("");
//     const [filterStatus, setFilterStatus] = useState("All");
//     const navigate = useNavigate();

//     const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
//     const requestedBy = loggedInUser.emp_id;

//     useEffect(() => {
//         const fetchPurchaseOrders = async () => {
//             setLoading(true);
//             try {
//                 const submissionMessage = localStorage.getItem("submissionMessage");
//                 const messageType = localStorage.getItem("messageType");

//                 if (submissionMessage) {
//                     if (messageType === "success") {
//                         toast.success(submissionMessage);
//                     } else if (messageType === "error") {
//                         toast.error(submissionMessage);
//                     }
//                     setTimeout(() => {
//                         localStorage.removeItem("submissionMessage");
//                         localStorage.removeItem("messageType");
//                     }, 5000);
//                 }

//                 const response = await axios.get(`${API_CONFIG.APIURL}/bo/customerdetails`, {
//                     params: { requestedBy: requestedBy }
//                 });
//                 console.log("api response of customer: ", response.data.data)
//                 if (response.data.data) {
//                     setPurchaseOrders(response.data.data);
//                 } else {
//                     message.error("Failed to fetch purchase orders");
//                 }
//             } catch (error) {
//                 console.error("Error fetching purchase orders:", error);
//                 message.error("Error fetching purchase orders");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPurchaseOrders();
//     }, []);

//     const handleEditCustomer = (docket_id) => {
//         navigate(`/bo-user/customeredit/${docket_id}`, { state: { docket_id } });
//     };

//     const handleAddNewCustomer = () => {
//         navigate("/bo-user/customer");
//     };

//     const handleSearch = (e) => {
//         setSearchText(e.target.value.toLowerCase());
//     };

//     const statusColors = {
//         Approved: "green",
//         Rejected: "red",
//         Pending: "orange"
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '-';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//     };

//     const displayedPOs = purchaseOrders.filter(po => {
//         const matchesStatus = filterStatus === "All" || po.po_status === filterStatus;
//         const matchesSearch = Object.values(po).some(val =>
//             String(val).toLowerCase().includes(searchText)
//         );
//         return matchesStatus && matchesSearch;
//     });

//     const columns = [
//         {
//             title: "Customer ID",
//             dataIndex: "customer_id",
//             key: "customer_id",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//         },
//         {
//             title: "Loan Application No",
//             dataIndex: "loan_app_no",
//             key: "loan_app_no",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//         },
//         {
//             title: "Instakit No",
//             dataIndex: "docket_id",
//             key: "docket_id",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//         },
//         {
//             title: "Issued Date",
//             dataIndex: "issue_date",
//             key: "issue_date",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//             render: (text) => formatDate(text),
//         },
//         {
//             title: "Status",
//             dataIndex: "status",
//             key: "status",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//             render: (status) => (
//                 <Tag color={statusColors[status] || "blue"}>{status}</Tag>
//             ),
//         },
//         {
//             title: "Action",
//             key: "action",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "lightgrey", color: "black" }
//             }),
//             render: (_, record) => (
//                 <Button
//                     icon={<EditOutlined />}
//                     onClick={() => handleEditCustomer(record.docket_id)}
//                 >
//                     Edit
//                 </Button>
//             ),
//         }
//     ];


//     return (
//         <>
//             <Navbar />
//             <ToastContainer />
//             <Box sx={{ p: 2 }}>
//                 <Box sx={{
//                     marginBottom: 0,
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                 }}>
//                     <h4>Customer Details</h4>
//                     <Input
//                         placeholder="Search..."
//                         onChange={handleSearch}
//                         style={{ width: 200 }}
//                     />
//                     {/* <Select
//                         value={filterStatus}
//                         onChange={setFilterStatus}
//                         style={{ width: 150 }}
//                     >
//                         <Option value="All">All</Option>
//                         <Option value="Y">Approved</Option>
//                         <Option value="N">Pending</Option>
//                      <Option value="Rejected">Rejected</Option> 
//                     </Select> */}
//                     <Button type="primary" onClick={handleAddNewCustomer}>
//                         + Assign Customer
//                     </Button>
//                 </Box>

//                 {loading ? (
//                     <Spin size="large" />
//                 ) : (
//                     <Table
//                         columns={columns}
//                         dataSource={displayedPOs}
//                         rowKey="id"
//                         pagination={{ pageSize: 10 }}
//                     />
//                 )}
//             </Box>
//         </>
//     );
// };

// export default CustomerMain;


import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Stack, Box, TextField, MenuItem, Button, Typography
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import { API_CONFIG } from '../../configuration';

const CustomerMain = () => {
    const location = useLocation();
    const passedDocketId = location.state?.instakit_no || "";
    const [formData, setFormData] = useState({
        customer_id: "",
        loan_app_no: "",
        docket_id: passedDocketId,
        issue_date: ""
    });

    const [instakitOptions, setInstakitOptions] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_CONFIG.APIURL}//bos/instakits`)
            .then((res) => {
                setInstakitOptions(res.data);
            })
            .catch((err) => {
                console.error("Error fetching docket IDs", err);
            });
    }, []);

    useEffect(() => {
        const { customer_id, loan_app_no, docket_id, issue_date } = formData;
        setIsFormValid(customer_id && loan_app_no && docket_id && issue_date);
    }, [formData]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleBack = async () => {
        navigate('/bo-user/boassign')
    }

    const handleSubmit = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const payload = {
                customerID: formData.customer_id,
                loanApplicationNo: formData.loan_app_no,
                instakitNo: formData.docket_id,
                issuedDate: formData.issue_date,
                requestedBy: loggedInUser.emp_id || "SYSTEM",
            };

            const response = await axios.post(`${API_CONFIG.APIURL}/bo/createcustomer`, payload);
            if (response.ok) {
                alert(response.data.message);
                navigate("/bo-user/boassign");
            } else {
                alert(`${response.data.message}` || "Assignment failed.");
                navigate("/bo-user/boassign");
            }
        } catch (error) {
            console.error("Assignment error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`${error.response.data.message}`);
            } else if (error.message) {
                alert(` ${error.message}`);
            } else {
                alert("❌ Assignment failed due to an unknown error.");
            }
        }
    };


    return (
        <>
            <Navbar />

            <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
                <Typography variant="h5" gutterBottom>
                    Customer Assign Details
                </Typography>

                <TextField
                    label="Customer ID"
                    fullWidth
                    margin="normal"
                    value={formData.customer_id}
                    onChange={handleChange("customer_id")}
                />

                <TextField
                    label="Loan Application ID"
                    fullWidth
                    margin="normal"
                    value={formData.loan_app_no}
                    onChange={handleChange("loan_app_no")}
                />

                <TextField
                    label="InstaKit No."
                    fullWidth
                    margin="normal"
                    value={formData.docket_id}
                    disabled
                />

                <TextField
                    label="Issue Date"
                    fullWidth
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.issue_date}
                    onChange={handleChange("issue_date")}
                />
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        fullWidth
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={!isFormValid}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Stack>
            </Box>
        </>
    );
};

export default CustomerMain;