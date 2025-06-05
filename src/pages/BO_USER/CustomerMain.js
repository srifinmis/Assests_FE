

import React, { useState, useEffect } from "react";
import { Table, Spin, message, Button, Input, Select, Tag } from "antd";
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { Box, IconButton, CircularProgress, Hidden } from "@mui/material";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { API_CONFIG } from '../../configuration';

const { Option } = Select;

const CustomerMain = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [invoiceData, setInvoiceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const requestedBy = loggedInUser.emp_id;

    useEffect(() => {
        const fetchPurchaseOrders = async () => {
            setLoading(true);
            try {
                const submissionMessage = localStorage.getItem("submissionMessage");
                const messageType = localStorage.getItem("messageType");

                if (submissionMessage) {
                    if (messageType === "success") {
                        toast.success(submissionMessage);
                    } else if (messageType === "error") {
                        toast.error(submissionMessage);
                    }
                    setTimeout(() => {
                        localStorage.removeItem("submissionMessage");
                        localStorage.removeItem("messageType");
                    }, 5000);
                }

                const response = await axios.get(`${API_CONFIG.APIURL}/bo/customerdetails`, {
                    params: { requestedBy: requestedBy }
                });
                console.log("api response of customer: ", response.data.data)
                if (response.data.data) {
                    setPurchaseOrders(response.data.data);
                } else {
                    message.error("Failed to fetch purchase orders");
                }
            } catch (error) {
                console.error("Error fetching purchase orders:", error);
                message.error("Error fetching purchase orders");
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseOrders();
    }, []);

    const handleEditCustomer = (docket_id) => {
        navigate(`/bo-user/customeredit/${docket_id}`, { state: { docket_id } });
    };

    const handleAddNewCustomer = () => {
        navigate("/bo-user/customer");
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const statusColors = {
        Approved: "green",
        Rejected: "red",
        Pending: "orange"
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const displayedPOs = purchaseOrders.filter(po => {
        const matchesStatus = filterStatus === "All" || po.po_status === filterStatus;
        const matchesSearch = Object.values(po).some(val =>
            String(val).toLowerCase().includes(searchText)
        );
        return matchesStatus && matchesSearch;
    });

    const columns = [
        {
            title: "Customer ID",
            dataIndex: "customer_id",
            key: "customer_id",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
        },
        {
            title: "Loan Application No",
            dataIndex: "loan_app_no",
            key: "loan_app_no",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
        },
        {
            title: "Instakit No",
            dataIndex: "docket_id",
            key: "docket_id",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
        },
        {
            title: "Issued Date",
            dataIndex: "issue_date",
            key: "issue_date",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
            render: (text) => formatDate(text),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
            render: (status) => (
                <Tag color={statusColors[status] || "blue"}>{status}</Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            onHeaderCell: () => ({
                style: { backgroundColor: "lightgrey", color: "black" }
            }),
            render: (_, record) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditCustomer(record.docket_id)}
                >
                    Edit
                </Button>
            ),
        }
    ];


    return (
        <>
            <Navbar />
            <ToastContainer />
            <Box sx={{ p: 2 }}>
                <Box sx={{
                    marginBottom: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h4>Customer Details</h4>
                    <Input
                        placeholder="Search..."
                        onChange={handleSearch}
                        style={{ width: 200 }}
                    />
                    {/* <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: 150 }}
                    >
                        <Option value="All">All</Option>
                        <Option value="Y">Approved</Option>
                        <Option value="N">Pending</Option>
                     <Option value="Rejected">Rejected</Option> 
                    </Select> */}
                    <Button type="primary" onClick={handleAddNewCustomer}>
                        + Assign Customer
                    </Button>
                </Box>

                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={displayedPOs}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Box>
        </>
    );
};

export default CustomerMain;
