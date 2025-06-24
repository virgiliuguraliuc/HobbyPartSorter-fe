import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ExcelJS from "exceljs";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const ImportItemsExcel = ({ show, onClose }) => {
  const [locations, setLocations] = useState([]);
  const [containers, setContainers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedContainer, setSelectedContainer] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (show) {
      fetch(`${getApiBaseUrl()}/api/locations/GetLocations`)
        .then((res) => res.json())
        .then(setLocations);

      fetch(`${getApiBaseUrl()}/api/containers/GetContainers`)
        .then((res) => res.json())
        .then(setContainers);
    }
  }, [show]);

  const handleImport = async () => {
    if (!file || !selectedLocation || !selectedContainer) return alert("Please select all fields");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.getWorksheet("Items");

    const categoriesMap = {};

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const [
        ItemName,
        CategoryName,
        Weight,
        Price,
        Quantity,
        Description,
      ] = row.values.slice(1); // skip null at index 0

      let CategoryID = categoriesMap[CategoryName];
      if (!CategoryID) {
        const res = await authFetch(`${getApiBaseUrl()}/api/categories/AddCategory`, {
          method: "POST",
          body: JSON.stringify({ CategoryName }),
        });
        const data = await res.json();
        CategoryID = data.CategoryID;
        categoriesMap[CategoryName] = CategoryID;
      }

      await authFetch(`${getApiBaseUrl()}/api/items/AddItem`, {
        method: "POST",
        body: JSON.stringify({
          ItemName,
          CategoryID,
          Weight,
          Price,
          Quantity,
          Description,
          ContainerID: selectedContainer,
        }),
      });
    }

    alert("Import complete.");
    setFile(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Items from Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Select Location (for container fallback)</Form.Label>
          <Form.Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Choose location</option>
            {locations.map((loc) => (
              <option key={loc.LocationID} value={loc.LocationID}>
                {loc.LocationName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Container (for all items)</Form.Label>
          <Form.Select
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
          >
            <option value="">Choose container</option>
            {containers.map((c) => (
              <option key={c.ContainerID} value={c.ContainerID}>
                {c.ContainerName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Excel File</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="success" onClick={handleImport} disabled={!file || !selectedContainer}>
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportItemsExcel;
