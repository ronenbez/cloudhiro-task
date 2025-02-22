import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

interface SpotPrice {
  instance_type: string;
  region: string;
  price: number;
  timestamp: string;
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
    // console.log(item)
    item.instance_type.toLowerCase().includes(search.toLowerCase())
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
      <Table striped bordered hover>
        <thead>
          <tr>
            {["instanceType", "region", "price", "timestamp"].map((key) => (
              <th key={key} onClick={() => {
                setSortKey(key as keyof SpotPrice);
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}>
                {key.toUpperCase()} {sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
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
