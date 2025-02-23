import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

interface SpotPrice {
  instance_type: string;
  region: string;
  price: number;
  timestamp: string;
  isSteal: boolean;
}

const SpotPricingTable: React.FC = () => {
  const [data, setData] = useState<SpotPrice[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof SpotPrice | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    axios.get("http://localhost:5000/api/spot-pricing")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

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
  
  return (
    <div className="container mt-4">
      <h2>AWS Spot Pricing</h2>
      <Form.Control
        type="text"
        placeholder="Search by instance type..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
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
          {sortedData.map((item, index) => (
            <tr key={index} className={item.isSteal ? "table-success" : ""}>
              <td>{item.instance_type}</td>
              <td>{item.region}</td>
              <td>${Number(item.price).toFixed(4)}</td>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SpotPricingTable;
