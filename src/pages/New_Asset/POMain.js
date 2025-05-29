import React, { useState, useEffect } from "react";
import { Table, Spin, message, Button, Input, Select, Tag } from "antd";
import { Box } from "@mui/material";
import Navbar from "../Navbar";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const { Option } = Select;

const POMain = ({ isDropped }) => {
    const API_URL = process.env.REACT_APP_API_URL;

    const [interestRates, setInterestRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInterestRates = async () => {
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
                const response = await axios.get(`${API_URL}/interest/fetchAll`);
                if (response.data.success) {
                    setInterestRates([...response.data.mainData, ...response.data.data]);
                } else {
                    message.error("Failed to fetch interest rate changes");
                }
            } catch (error) {
                console.error("Error fetching interest rate changes:", error);
                message.error("Error fetching interest rate changes");
            } finally {
                setLoading(false);
            }
        };
        fetchInterestRates();
    }, [API_URL]);

    const handleViewDetails = (sanction_id, lender_code, tranche_id, approval_status, createdat) => {
        navigate(`/interestratemaker/${sanction_id}`, {
            state: { sanction_id, lender_code, tranche_id, approval_status, createdat },
        });
    };

    const handleAddNewRateChange = () => {
        navigate("/new-assets/create-po");
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const statusColors = {
        Approved: "green",
        Rejected: "red",
        "Approval Pending": "orange",
    };

    const displayedInterestRates = interestRates
        .filter((rate) => {
            const matchesStatus =
                filterStatus === "All" || rate.approval_status === filterStatus;

            const matchesSearch = Object.values(rate).some((field) =>
                field?.toString().toLowerCase().includes(searchText)
            );

            return matchesStatus && matchesSearch;
        })
        .sort(
            (a, b) =>
                new Date(b.updatedat || b.createdat) -
                new Date(a.updatedat || a.createdat)
        );

    const columns = [
        {
            title: "Po Number", dataIndex: "po_num",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Asset Type", dataIndex: "asset_type",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Asset Creation At", dataIndex: "asset_creation_at",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        {
            title: "Po Date", dataIndex: "po_date",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
        },
        // {
        //     title: "Effective Date", dataIndex: "effective_date",
        //     onHeaderCell: () => ({
        //         style: { backgroundColor: "#a2b0cc", color: "black" }
        //     }),
        // },
        {
            title: "Status",
            dataIndex: "po_status",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
            render: (status) => (
                <Tag color={statusColors[status] || "blue"}>{status}</Tag>
            ),
        },
        {
            title: "Edit",
            dataIndex: "po_num",
            onHeaderCell: () => ({
                style: { backgroundColor: "#F4F6F8", color: "black" }
            }),
            render: (id, record) => (
                <Button
                    type="link"
                    onClick={() =>
                        handleViewDetails(
                            id,
                            record.lender_code,
                            record.tranche_id,
                            record.approval_status,
                            record.createdat
                        )
                    }
                >
                    View
                </Button>
            ),
        },
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
                    // marginLeft:"20px",
                    transition: "margin-left 0.3s ease-in-out",
                    // width: isDropped ? "calc(100% - 180px)" : "calc(100% - 350px)",
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
                    <h2 style={{ flex: 1 }}>Purchase Order</h2>
                    <Input
                        placeholder="Search Purchase Order changes..."
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
                        <Option value="Approved">Approved</Option>
                        <Option value="Approval Pending">Approval Pending</Option>
                        <Option value="Rejected">Rejected</Option>
                    </Select>
                    <Button type="primary" style={{ height: "40px" }} onClick={handleAddNewRateChange}>
                        Create Purchase Order
                    </Button>
                </div>

                {loading ? (
                    <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
                ) : (
                    <div style={{
                        // border: "2px solid #ccc", 
                        position: "relative", borderRadius: "8px", padding: "0px"
                    }}>
                        <Table
                            bordered
                            size="medium"
                            dataSource={displayedInterestRates}
                            columns={columns}
                            rowKey="change_id"
                            pagination={{ pageSize: 6 }}
                        />
                        {/* <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
                        Total Records : {displayedInterestRates.length}
                    </div> */}
                    </div>
                )}
            </Box>
        </>
    );
};

export default POMain;
