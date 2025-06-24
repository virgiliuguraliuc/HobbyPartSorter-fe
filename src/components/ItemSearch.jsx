// src/components/ItemSearch.jsx
import React, { useState, useEffect } from "react";
import { Alert, Form, InputGroup } from "react-bootstrap";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";
import ExportItemsExcel from "./ExportItemsExcel";

const ItemSearch = () => {
  const [query, setQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [items, setItems] = useState([]);
  const [itemLocations, setItemLocations] = useState([]);
  const [containers, setContainers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [itemsRes, itemLocRes, containersRes, locationsRes] = await Promise.all([
        authFetch(`${getApiBaseUrl()}/api/ItemsBlob/GetItems`),
        authFetch(`${getApiBaseUrl()}/api/item_locations/GetItemLocations`),
        authFetch(`${getApiBaseUrl()}/api/containers/GetContainers`),
        authFetch(`${getApiBaseUrl()}/api/locations/GetLocations`),
      ]);
      setItems(await itemsRes.json());
      setItemLocations(await itemLocRes.json());
      setContainers(await containersRes.json());
      setLocations(await locationsRes.json());
    };
    fetchAll();
  }, []);

  const handleSearch = (input) => {
    setQuery(input);
    const lowerInput = input.toLowerCase();
    if (input.length < 2) {
      setShowAlert(false);
      return;
    }

    const matchedItem = items.find((item) =>
      item.ItemName.toLowerCase().includes(lowerInput)
    );

    if (matchedItem) {
      const link = itemLocations.find(
        (loc) => loc.ItemID === matchedItem.ItemID
      );
      const container = containers.find(
        (c) => c.ContainerID === link?.ContainerID
      );
      const location = locations.find(
        (l) => l.LocationID === container?.LocationID
      );

      setSearchResult({
        itemName: matchedItem.ItemName,
        containerName: container?.ContainerName || "Unknown",
        locationName: location?.LocationName || "Unknown",
      });
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  return (
    <>
      <InputGroup className="me-3" style={{ maxWidth: "250px" }}>
        <Form.Control
          type="text"
          className="text-end"
          placeholder=" Search item..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </InputGroup>

      {showAlert && searchResult && (
        <Alert
          variant="info"
          onClose={() => setShowAlert(false)}
          dismissible
          style={{
            position: "fixed",
            top: "75px",
            right: "20px",
            zIndex: 1050,
            width: "300px",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <strong>{searchResult.itemName}</strong><br />
          <strong>Container:</strong> {searchResult.containerName}<br />
          <strong>Location:</strong> {searchResult.locationName}
        </Alert>
      )}
    </>
  );
};

export default ItemSearch;
