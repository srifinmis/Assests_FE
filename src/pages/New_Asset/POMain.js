import React, { useState, useEffect } from "react";
import { Table, Spin, message, Button, Input, Select, Tag } from "antd";
import { EditOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import { Box } from "@mui/material";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_CONFIG, REFRESH_CONFIG } from '../../configuration';

const { Option } = Select;

const POMain = ({ isDropped }) => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [invoiceData, setinvoiceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPurchaseOrders = async () => {
            setLoading(true);

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

            try {
                const response = await axios.get(`${API_CONFIG.APIURL}/po/po-details`);
                if (response.data) {
                    setPurchaseOrders(response.data);
                } else {
                    message.error("Failed to fetch invoice Data");
                }
            } catch (error) {
                console.error("Error fetching purchase orders :", error);
                message.error("Error fetching purchase orders ");
            } finally {
                setLoading(false);
            }
        };
        const fetchInvoiceAssignments = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_CONFIG.APIURL}/invoices/pobyids`);
                // console.log("po invoice data: ", response.data)
                if (response.data) {
                    setinvoiceData(response.data);
                } else {
                    message.error("Failed to fetch invoice Data");
                }
            } catch (error) {
                console.error("Error fetching invoice Data:", error);
                message.error("Error fetching invoice Data");
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseOrders();
        fetchInvoiceAssignments();
    }, []);

    const handleEditPO = (po_number) => {
        navigate(`/new-assets/edit-po/${po_number}`, {
            state: {
                po_number: po_number
            }
        });
    };
    const handleEditInvoice = (po_number) => {
        navigate(`/new-assets/edit-invoice/${po_number}`, {
            state: {
                po_number: po_number
            }
        });
    };


    const handleAddNewPO = () => {
        navigate("/new-assets/create-po");
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };
    const handleInvoiceUpload = (po_number) => {
        navigate(`/new-assets/upload-invoice/${po_number}`, {
            state: {
                po_number: po_number
            }
        });
    }

    const statusColors = {
        "Approved": "green",
        "Rejected": "red",
        "Pending": "orange"
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const displayedPOs = purchaseOrders
        .filter((po) => {
            const matchesStatus =
                filterStatus === "All" || po.po_status === filterStatus;

            const matchesSearch = Object.values(po).some((field) =>
                field?.toString().toLowerCase().includes(searchText)
            );

            return matchesStatus && matchesSearch;
        });

    const columns = [
        {
            title: "PO Number",
            dataIndex: "po_number",
            key: "po_number",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Asset Type",
            dataIndex: "asset_type",
            key: "asset_type",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Asset Creation",
            dataIndex: "asset_creation_at",
            key: "asset_creation_at",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "PO Date",
            dataIndex: "po_date",
            key: "po_date",
            render: (date) => formatDate(date),
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Status",
            dataIndex: "po_status",
            key: "po_status",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
            render: (status) => (
                <Tag color={statusColors[status] || "orange"}>{status || 'Pending'}</Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
            render: (_, record) => (
                record.po_status === "Approved" ? (
                    <EditOutlined
                        style={{
                            fontSize: '18px',
                            color: '#d9d9d9',
                            cursor: 'not-allowed'
                        }}
                        disabled
                    />
                ) : (
                    <EditOutlined
                        style={{
                            fontSize: '18px',
                            color: '#1890ff',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleEditPO(record.po_number)}
                    />
                )
            ),
        },
        {
            title: "Invoice",
            key: "invoice",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
            render: (_, record) => {
                const invoice = invoiceData.find(inv => inv.po_num === record.po_number);
                const invoiceStatus = invoice?.invoice_status || 'Upload File';

                const isUploadStatus = !invoiceStatus; // status: Upload (no invoice yet)

                const disableUpload =
                    record.po_status === "Pending" ||
                    record.po_status === "Rejected" ||
                    invoiceStatus === "Pending" ||
                    invoiceStatus === "Rejected" ||
                    invoiceStatus === "Approved";

                // BUT allow upload if no invoice exists (i.e., status is "Upload")
                const finalDisableUpload = disableUpload && !isUploadStatus;

                const disableEdit =
                    record.po_status === "Pending" ||
                    record.po_status === "Rejected" ||
                    invoiceStatus === "Approved" ||
                    invoiceStatus === 'Upload File';

                const uploadIconStyle = {
                    fontSize: '18px',
                    cursor: finalDisableUpload ? 'not-allowed' : 'pointer',
                    color: finalDisableUpload ? '#d9d9d9' : '#1890ff',
                    marginRight: '10px'
                };

                const editIconStyle = {
                    fontSize: '18px',
                    cursor: disableEdit ? 'not-allowed' : 'pointer',
                    color: disableEdit ? '#d9d9d9' : '#1890ff'
                };

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <span style={{ display: 'flex', gap: '8px' }}>
                            <UploadOutlined
                                style={uploadIconStyle}
                                onClick={() => {
                                    if (!finalDisableUpload) handleInvoiceUpload(record.po_number);
                                }}
                            />
                            <EditOutlined
                                style={editIconStyle}
                                onClick={() => {
                                    if (!disableEdit) handleEditInvoice(record.po_number);
                                }}
                            />
                        </span>
                        <span style={{ fontSize: '12px', color: '#555' }}>
                            Status: {invoiceStatus}
                        </span>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <Navbar />
            <Box
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "400px",
                    marginTop: "10px",
                    transition: "margin-left 0.3s ease-in-out",
                    padding: 30,
                }}
            >
                <ToastContainer position="top-right" autoClose={5000} />
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h2 style={{ flex: 1 }}>Purchase Orders</h2>
                    <Input
                        placeholder="Search purchase orders..."
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: "250px", height: "40px" }}
                    />
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: "200px", height: "40px" }}
                    >
                        <Option value="All">All</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Approved">Approved</Option>
                        <Option value="Rejected">Rejected</Option>
                    </Select>
                    <Button type="primary" style={{ height: "40px" }} onClick={handleAddNewPO}>
                        Create Purchase Order
                    </Button>
                </div>

                {loading ? (
                    <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
                ) : (
                    <div style={{
                        position: "relative",
                        borderRadius: "8px",
                        padding: "0px"
                    }}>
                        <Table
                            bordered
                            size="medium"
                            dataSource={displayedPOs}
                            columns={columns}
                            rowKey="po_number"
                            pagination={{ pageSize: 6 }}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default POMain;
