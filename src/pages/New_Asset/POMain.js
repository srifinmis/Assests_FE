// import React, { useState, useEffect } from "react";
// import { Table, Spin, message, Button, Input, Select, Tag } from "antd";
// import { EditOutlined } from '@ant-design/icons';
// import { UploadOutlined } from '@ant-design/icons';
// import { Box, IconButton, CircularProgress } from "@mui/material";
// import Navbar from "../Navbar";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import CloseIcon from "@mui/icons-material/Close";
// import { API_CONFIG, REFRESH_CONFIG } from '../../configuration';

// const { Option } = Select;

// const POMain = ({ isDropped }) => {
//     const [purchaseOrders, setPurchaseOrders] = useState([]);
//     const [invoiceData, setinvoiceData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchText, setSearchText] = useState("");
//     const [filterStatus, setFilterStatus] = useState("All");
//     const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
//     const [openPreview, setOpenPreview] = useState(false);
//     const [previewUrl, setPreviewUrl] = useState("");
//     const [loadingPreview, setLoadingPreview] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchPurchaseOrders = async () => {
//             setLoading(true);

//             const submissionMessage = localStorage.getItem("submissionMessage");
//             const messageType = localStorage.getItem("messageType");

//             if (submissionMessage) {
//                 if (messageType === "success") {
//                     toast.success(submissionMessage);
//                 } else if (messageType === "error") {
//                     toast.error(submissionMessage);
//                 }
//                 setTimeout(() => {
//                     localStorage.removeItem("submissionMessage");
//                     localStorage.removeItem("messageType");
//                 }, 5000);
//             }

//             try {
//                 const response = await axios.get(`${API_CONFIG.APIURL}/po/po-details`);
//                 if (response.data) {
//                     setPurchaseOrders(response.data);
//                     console.log("purches order: ", response.data)
//                 } else {
//                     message.error("Failed to fetch invoice Data");
//                 }
//             } catch (error) {
//                 console.error("Error fetching purchase orders :", error);
//                 message.error("Error fetching purchase orders ");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         const fetchInvoiceAssignments = async () => {
//             setLoading(true);
//             try {
//                 const response = await axios.get(`${API_CONFIG.APIURL}/invoices/pobyids`);
//                 // console.log("po invoice data: ", response.data)
//                 if (response.data) {
//                     setinvoiceData(response.data);
//                 } else {
//                     message.error("Failed to fetch invoice Data");
//                 }
//             } catch (error) {
//                 console.error("Error fetching invoice Data:", error);
//                 message.error("Error fetching invoice Data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPurchaseOrders();
//         fetchInvoiceAssignments();
//     }, []);

//     const handleEditPO = (po_number) => {
//         navigate(`/new-assets/edit-po/${po_number}`, {
//             state: {
//                 po_number: po_number
//             }
//         });
//     };
//     const handleEditInvoice = (po_number) => {
//         navigate(`/new-assets/edit-invoice/${po_number}`, {
//             state: {
//                 po_number: po_number
//             }
//         });
//     };

//     const handleAddNewPO = () => {
//         navigate("/new-assets/create-po");
//     };

//     const handleSearch = (e) => {
//         setSearchText(e.target.value.toLowerCase());
//     };
//     const handleInvoiceUpload = (po_number) => {
//         navigate(`/new-assets/upload-invoice/${po_number}`, {
//             state: {
//                 po_number: po_number
//             }
//         });
//     }
//     const handlePreview = async (poNum) => {
//         try {
//             setLoadingPreview(true);
//             const response = await axios.get(
//                 `${API_CONFIG.APIURL}/approval/purchaseorder/get_po_pdf/${encodeURIComponent(poNum)}`,
//                 {
//                     responseType: 'blob',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             const blob = new Blob([response.data], { type: "application/pdf" });
//             const url = window.URL.createObjectURL(blob);
//             setPreviewUrl(url);
//             setOpenPreview(true);
//         } catch (error) {
//             console.error("Error loading preview:", error);
//             setSnackbar({
//                 open: true,
//                 message: "Failed to load preview. Please try again.",
//                 severity: "error"
//             });
//         } finally {
//             setLoadingPreview(false);
//         }
//     };

//     const statusColors = {
//         "Approved": "green",
//         "Rejected": "red",
//         "Pending": "orange"
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '-';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const displayedPOs = purchaseOrders
//         .filter((po) => {
//             const matchesStatus =
//                 filterStatus === "All" || po.po_status === filterStatus;

//             const matchesSearch = Object.values(po).some((field) =>
//                 field?.toString().toLowerCase().includes(searchText)
//             );
//             return matchesStatus && matchesSearch;
//         });

//     const columns = [
//         {
//             title: "PO Number",
//             dataIndex: "po_number",
//             key: "po_number",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//         },
//         {
//             title: "Asset Type",
//             dataIndex: "asset_type",
//             key: "asset_type",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//         },
//         {
//             title: "Asset Creation",
//             dataIndex: "asset_creation_at",
//             key: "asset_creation_at",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//         },
//         {
//             title: "PO Date",
//             dataIndex: "po_date",
//             key: "po_date",
//             render: (date) => formatDate(date),
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//         },
//         {
//             title: "Status",
//             dataIndex: "po_status",
//             key: "po_status",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//             render: (status) => (
//                 <Tag color={statusColors[status] || "orange"}>{status || 'Pending'}</Tag>
//             ),
//         },
//         {
//             title: "View",
//             key: "view",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//             render: (_, record) => (
//                 <IconButton
//                     onClick={() => handlePreview(record.po_num)}
//                     disabled={loadingPreview}
//                     aria-label="Preview PDF"
//                 >
//                     {loadingPreview ? <CircularProgress size={24} /> : <VisibilityIcon />}
//                 </IconButton>
//             ),
//         },
//         {
//             title: "Actions",
//             key: "actions",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//             render: (_, record) => (
//                 record.po_status === "Approved" ? (
//                     <EditOutlined
//                         style={{
//                             fontSize: '18px',
//                             color: '#d9d9d9',
//                             cursor: 'not-allowed'
//                         }}
//                         disabled
//                     />
//                 ) : (
//                     <EditOutlined
//                         style={{
//                             fontSize: '18px',
//                             color: '#1890ff',
//                             cursor: 'pointer'
//                         }}
//                         onClick={() => handleEditPO(record.po_number)}
//                     />
//                 )
//             ),
//         },
//         {
//             title: "Invoice",
//             key: "invoice",
//             onHeaderCell: () => ({
//                 style: { backgroundColor: "#F4F6F8", color: "black" }
//             }),
//             render: (_, record) => {
//                 const invoice = invoiceData.find(inv => inv.po_num === record.po_number);
//                 const invoiceStatus = invoice?.invoice_status || 'Upload File';

//                 const isUploadStatus = !invoiceStatus; // status: Upload (no invoice yet)

//                 const disableUpload =
//                     record.po_status === "Pending" ||
//                     record.po_status === "Rejected" ||
//                     invoiceStatus === "Pending" ||
//                     invoiceStatus === "Rejected" ||
//                     invoiceStatus === "Approved";

//                 // BUT allow upload if no invoice exists (i.e., status is "Upload")
//                 const finalDisableUpload = disableUpload && !isUploadStatus;

//                 const disableEdit =
//                     record.po_status === "Pending" ||
//                     record.po_status === "Rejected" ||
//                     invoiceStatus === "Approved" ||
//                     invoiceStatus === 'Upload File';

//                 const uploadIconStyle = {
//                     fontSize: '18px',
//                     cursor: finalDisableUpload ? 'not-allowed' : 'pointer',
//                     color: finalDisableUpload ? '#d9d9d9' : '#1890ff',
//                     marginRight: '10px'
//                 };

//                 const editIconStyle = {
//                     fontSize: '18px',
//                     cursor: disableEdit ? 'not-allowed' : 'pointer',
//                     color: disableEdit ? '#d9d9d9' : '#1890ff'
//                 };

//                 return (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
//                         <span style={{ display: 'flex', gap: '8px' }}>
//                             <UploadOutlined
//                                 style={uploadIconStyle}
//                                 onClick={() => {
//                                     if (!finalDisableUpload) handleInvoiceUpload(record.po_number);
//                                 }}
//                             />
//                             <EditOutlined
//                                 style={editIconStyle}
//                                 onClick={() => {
//                                     if (!disableEdit) handleEditInvoice(record.po_number);
//                                 }}
//                             />
//                         </span>
//                         <span style={{ fontSize: '12px', color: '#555' }}>
//                             Status: {invoiceStatus}
//                         </span>
//                     </div>
//                 );
//             }
//         }
//     ];

//     return (
//         <>
//             <Navbar />
//             <Box
//                 style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     height: "400px",
//                     marginTop: "10px",
//                     transition: "margin-left 0.3s ease-in-out",
//                     padding: 30,
//                 }}
//             >
//                 <ToastContainer position="top-right" autoClose={5000} />
//                 <div
//                     style={{
//                         display: "flex",
//                         gap: "10px",
//                         flexWrap: "wrap",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "20px",
//                     }}
//                 >
//                     <h2 style={{ flex: 1 }}>Purchase Orders</h2>
//                     <Input
//                         placeholder="Search purchase orders..."
//                         value={searchText}
//                         onChange={handleSearch}
//                         style={{ width: "250px", height: "40px" }}
//                     />
//                     <Select
//                         value={filterStatus}
//                         onChange={setFilterStatus}
//                         style={{ width: "200px", height: "40px" }}
//                     >
//                         <Option value="All">All</Option>
//                         <Option value="Pending">Pending</Option>
//                         <Option value="Approved">Approved</Option>
//                         <Option value="Rejected">Rejected</Option>
//                     </Select>
//                     <Button type="primary" style={{ height: "40px" }} onClick={handleAddNewPO}>
//                         Create Purchase Order
//                     </Button>
//                 </div>

//                 {loading ? (
//                     <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
//                 ) : (
//                     <div style={{
//                         position: "relative",
//                         borderRadius: "8px",
//                         padding: "0px"
//                     }}>
//                         <Table
//                             bordered
//                             size="medium"
//                             dataSource={displayedPOs}
//                             columns={columns}
//                             rowKey="po_number"
//                             pagination={{ pageSize: 6 }}
//                         />
//                     </div>
//                 )}
//             </Box>
//         </>
//     );
// };

// export default POMain;


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

const POMain = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [invoiceData, setInvoiceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [previewUrl, setPreviewUrl] = useState("");
    const [openPreview, setOpenPreview] = useState(false);
    const [loadingPreviewId, setLoadingPreviewId] = useState(null);
    const navigate = useNavigate();

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

                const response = await axios.get(`${API_CONFIG.APIURL}/po/po-details`);
                if (response.data) {
                    setPurchaseOrders(response.data);
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

        const fetchInvoiceAssignments = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_CONFIG.APIURL}/invoices/pobyids`);
                if (response.data) {
                    setInvoiceData(response.data);
                } else {
                    message.error("Failed to fetch invoice data");
                }
            } catch (error) {
                console.error("Error fetching invoice data:", error);
                message.error("Error fetching invoice data");
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseOrders();
        fetchInvoiceAssignments();
    }, []);

    const handleEditPO = (po_number) => {
        navigate(`/new-assets/edit-po/:${po_number}`, { state: { po_number } });
    };

    const handleEditInvoice = (po_number) => {
        navigate(`/new-assets/edit-invoice/:${po_number}`, { state: { po_number } });
    };

    const handleAddNewPO = () => {
        navigate("/new-assets/create-po");
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const handleInvoiceUpload = (po_number) => {
        navigate(`/new-assets/upload-invoice/:${po_number}`, { state: { po_number } });
    };

    const handlePreview = async (po_number) => {
        try {
            setLoadingPreviewId(po_number);
            const response = await axios.get(
                `${API_CONFIG.APIURL}/approval/purchaseorder/get_po_pdf/${encodeURIComponent(po_number)}`,
                {
                    responseType: 'blob',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
            setOpenPreview(true);
        } catch (error) {
            console.error("Error loading preview:", error);
            toast.error("Failed to load preview. Please try again.");
        } finally {
            setLoadingPreviewId(null);
        }
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
        const matchesSearch = Object.values(po).some(field =>
            field?.toString().toLowerCase().includes(searchText)
        );
        return matchesStatus && matchesSearch;
    });

    const columns = [
        {
            title: "PO Number",
            dataIndex: "po_number",
            key: "po_number",
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "Asset Type",
            dataIndex: "asset_type",
            key: "asset_type",
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "Asset Creation",
            dataIndex: "asset_creation_at",
            key: "asset_creation_at",
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "PO Date",
            dataIndex: "po_date",
            key: "po_date",
            render: formatDate,
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "Status",
            dataIndex: "po_status",
            key: "po_status",
            render: (status) => <Tag color={statusColors[status] || "orange"}>{status || "Pending"}</Tag>,
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "View",
            key: "view",
            render: (_, record) => (
                <IconButton
                    onClick={() => handlePreview(record.po_number)}
                    disabled={loadingPreviewId === record.po_number}
                    aria-label="Preview PDF"
                    size="large"
                >
                    {loadingPreviewId === record.po_number ? <CircularProgress size={24} /> : <VisibilityIcon />}
                </IconButton>
            ),
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "Edit",
            key: "edit",
            render: (_, record) =>
                record.po_status === "Approved" ? (
                    <EditOutlined
                        style={{ fontSize: 18, color: "#d9d9d9", cursor: "not-allowed" }}
                        disabled
                    />
                ) : (
                    <EditOutlined
                        style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
                        onClick={() => handleEditPO(record.po_number)}
                    />
                ),
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
        {
            title: "Invoice",
            key: "invoice",
            render: (_, record) => {
                const invoice = invoiceData.find(inv => inv.po_num === record.po_number);
                const invoiceStatus = invoice?.invoice_status || "Upload File";

                // Disable upload if PO is Pending/Rejected or invoice status is Pending/Rejected/Approved,
                // except allow upload if no invoice exists (status "Upload File")
                const disableUpload =
                    (record.po_status === "Pending" ||
                        record.po_status === "Rejected" ||
                        ["Pending", "Rejected", "Approved"].includes(invoiceStatus)) &&
                    invoiceStatus !== "Upload File";

                // Disable edit if PO is Pending/Rejected or invoice is Approved or no invoice uploaded
                const disableEdit =
                    record.po_status === "Pending" ||
                    record.po_status === "Rejected" ||
                    invoiceStatus === "Approved" ||
                    invoiceStatus === "Upload File";

                return (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                        <span style={{ display: "flex", gap: 8 }}>
                            <UploadOutlined
                                style={{
                                    fontSize: 18,
                                    cursor: disableUpload ? "not-allowed" : "pointer",
                                    color: disableUpload ? "#d9d9d9" : "#1890ff",
                                }}
                                onClick={() => !disableUpload && handleInvoiceUpload(record.po_number)}
                                disabled={disableUpload}
                                title={disableUpload ? "Upload disabled due to PO/Invoice status" : "Upload Invoice"}
                            />
                            <EditOutlined
                                style={{
                                    fontSize: 18,
                                    cursor: disableEdit ? "not-allowed" : "pointer",
                                    color: disableEdit ? "#d9d9d9" : "#1890ff",
                                }}
                                onClick={() => !disableEdit && handleEditInvoice(record.po_number)}
                                disabled={disableEdit}
                                title={disableEdit ? "Edit disabled due to PO/Invoice status" : "Edit Invoice"}
                            />
                        </span>
                        <Tag color={statusColors[invoiceStatus] || "default"}>{invoiceStatus}</Tag>
                    </div>
                );
            },
            onHeaderCell: () => ({ style: { backgroundColor: "#F4F6F8", color: "black" } }),
        },
    ];

    return (
        <>
            <Navbar />
            <ToastContainer />
            <Box sx={{ padding: 2 }}>
                <div
                    style={{
                        marginBottom: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h4>Purchase Order</h4>
                    <Input.Search
                        placeholder="Search by any field"
                        allowClear
                        onChange={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        defaultValue="All"
                        style={{ width: 200 }}
                        onChange={(value) => setFilterStatus(value)}
                    >
                        <Option value="All">All</Option>
                        <Option value="Approved">Approved</Option>
                        <Option value="Rejected">Rejected</Option>
                        <Option value="Pending">Pending</Option>
                    </Select>
                    <Button type="primary" onClick={handleAddNewPO}>
                        Add New PO
                    </Button>
                </div>
                {loading ? (
                    <div style={{ textAlign: "center", marginTop: 50 }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        size="small"
                        columns={columns}
                        dataSource={displayedPOs}
                        rowKey="po_number"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                    />
                )}

                {openPreview && (
                    <div
                        style={{
                            position: "fixed",
                            top: 70,
                            left: 50,
                            right: 70,
                            bottom: 20,
                            overflow: Hidden,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                            flexDirection: "column",
                        }}
                    >
                        <Button
                            type="primary"
                            onClick={() => {
                                setOpenPreview(false);
                                window.URL.revokeObjectURL(previewUrl);
                                setPreviewUrl("");
                            }}
                            style={{ marginBottom: 10 }}
                        >
                            Close Preview
                        </Button>
                        <iframe
                            title="PO PDF Preview"
                            src={previewUrl}
                            style={{ width: "90vw", height: "90vh", border: "none" }}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default POMain;
