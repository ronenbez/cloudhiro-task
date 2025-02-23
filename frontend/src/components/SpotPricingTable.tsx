import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Spinner } from "react-bootstrap";

const ITEMS_PER_PAGE = 10; 

interface SpotPrice {
  instance_type: string;
  region: string;
  price: number;
  timestamp: string;
  isSteal: boolean;
}

const SpotPricingTable: React.FC = () => {
  const [data, setData] = useState<SpotPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof SpotPrice | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/spot-pricing");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  // Handle search filter
  const filteredData = data.filter((item) =>
    item.instance_type.toLowerCase().includes(search.toLowerCase()) ||
    item.region.toLowerCase().includes(search.toLowerCase()) ||
    String(item.price).includes(search.toLowerCase()) || 
    item.timestamp.includes(search.toLowerCase())
  );

  // Handle sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const regenerateData = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/regenerate");
      fetchData(); // Refresh UI after regeneration
    } catch (error) {
      console.error("Error regenerating data:", error);
    }
    setLoading(false);
  };

    // Calculate displayed rows
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">AWS Spot Pricing</h2>
      <div className="d-flex">
        <Form.Control
            type="text"
            placeholder="Search by any column..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-50 mb-3"
        />
        <Button onClick={regenerateData} disabled={loading} className="ms-auto mb-3">
            {loading ? <Spinner animation="border" size="sm" /> : "Regenerate Data"}
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            {[['instance_type',"Instance Type"], ['region',"Region"], ['price',"Price"], ['timestamp',"Timestamp"]].map(([key, value]) => (
              <th key={key} onClick={() => {
                setSortKey(key as keyof SpotPrice);
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }} style={{cursor: 'pointer'}}>
                {value} {sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedData.map((item, index) => (
            <tr key={index} className={item.isSteal ? "table-success" : ""}>
              <td>{item.instance_type}</td>
              <td>{item.region}</td>
              <td>${Number(item.price).toFixed(4)}</td>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Buttons */}
      <div className="d-flex justify-content-center mt-3">
        <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </Button>
        <span className="mx-3 p-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default SpotPricingTable;
