import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Modal } from "react-bootstrap";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const ItemLocations = () => {
  const [itemLocations, setItemLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [containers, setContainers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState({ ItemID: "", ContainerID: "", ItemLocationID: null });

  const fetchItemLocations = async () => {
    try {
      const res = await authFetch(`${getApiBaseUrl()}/api/item_locations/GetItemLocations`);
      const data = await res.json();
      setItemLocations(data);
    } catch (err) {
      console.error("Failed to fetch item locations", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await authFetch(`${getApiBaseUrl()}/api/ItemsBlob/GetItems`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const fetchContainers = async () => {
    try {
      const res = await authFetch(`${getApiBaseUrl()}/api/containers/GetContainers`);
      const data = await res.json();
      setContainers(data);
    } catch (err) {
      console.error("Failed to fetch containers", err);
    }
  };

  const handleSave = async () => {
    try {
      const isEditing = !!newLink.ItemLocationID;
      const payload = {
        ItemID: parseInt(newLink.ItemID),
        ContainerID: parseInt(newLink.ContainerID),
        UserID: null,
      };

      if (isEditing) {
        // delete old record before re-inserting
        await authFetch(`${getApiBaseUrl()}/api/item_locations/DeleteItemLocation/${newLink.ItemLocationID}`, {
          method: "DELETE",
        });
      }

      const res = await authFetch(`${getApiBaseUrl()}/api/item_locations/AddItemLocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchItemLocations();
        setShowModal(false);
        setNewLink({ ItemID: "", ContainerID: "", ItemLocationID: null });
      } else {
        console.error("Failed to save item location");
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`${getApiBaseUrl()}/api/item_locations/DeleteItemLocation/${id}`, {
        method: "DELETE",
      });
      fetchItemLocations();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchItemLocations();
    fetchItems();
    fetchContainers();
  }, []);

  const getItemName = (id) => items.find((i) => i.ItemID === id)?.ItemName || "Unknown";
  const getContainerName = (id) => containers.find((c) => c.ContainerID === id)?.ContainerName || "Unknown";

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Item Locations</h5>
          <Button variant="primary" onClick={() => {
            setNewLink({ ItemID: "", ContainerID: "", ItemLocationID: null });
            setShowModal(true);
          }}>
            Add Item to Container
          </Button>
        </Card.Header>
        <Card.Body>
          <Table bordered>
            <thead>
              <tr>
                <th>Item</th>
                <th>Container</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {itemLocations.map((loc) => (
                <tr key={loc.ItemLocationID}>
                  <td>{getItemName(loc.ItemID)}</td>
                  <td>{getContainerName(loc.ContainerID)}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => {
                          setNewLink({
                            ItemID: loc.ItemID,
                            ContainerID: loc.ContainerID,
                            ItemLocationID: loc.ItemLocationID,
                          });
                          setShowModal(true);
                        }}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(loc.ItemLocationID)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{newLink.ItemLocationID ? "Edit" : "Assign"} Item to Container</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Item</Form.Label>
              <Form.Control
                as="select"
                value={newLink.ItemID}
                onChange={(e) => setNewLink({ ...newLink, ItemID: e.target.value })}
              >
                <option value="">-- Select Item --</option>
                {items.map((item) => (
                  <option key={item.ItemID} value={item.ItemID}>
                    {item.ItemName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Select Container</Form.Label>
              <Form.Control
                as="select"
                value={newLink.ContainerID}
                onChange={(e) => setNewLink({ ...newLink, ContainerID: e.target.value })}
              >
                <option value="">-- Select Container --</option>
                {containers.map((container) => (
                  <option key={container.ContainerID} value={container.ContainerID}>
                    {container.ContainerName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!newLink.ItemID || !newLink.ContainerID}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemLocations;
