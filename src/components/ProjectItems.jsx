import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";
import { authFetch } from "../utils/authFetch";

const ProjectItems = ({ ProjectID, availableItems }) => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const [modalData, setModalData] = useState({
    ProjectItemID: null,
    UserItemID: "",
    QuantityUsed: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjectItems = async () => {
    try {
      const response = await authFetch(
        `http://localhost:5000/api/ProjectsBlob/GetProjectItems/${ProjectID}`
      );
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading project items:", error);
    }
  };

  const handleSave = async () => {
    const payload = {
      ProjectItemID: modalData.ProjectItemID || null,
      ProjectID,
      UserItemID: parseInt(modalData.UserItemID),
      QuantityUsed: parseInt(modalData.QuantityUsed, 10),
    };

    const url = isEditing
      ? "http://localhost:5000/api/ProjectsBlob/UpdateProjectItem"
      : "http://localhost:5000/api/ProjectsBlob/AddProjectItem";

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchProjectItems();
        setShowModal(false);
      } else {
        console.error("Failed to save project item");
      }
    } catch (error) {
      console.error("Error saving project item:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedForDelete) return;

    try {
      const response = await authFetch(
        `http://localhost:5000/api/ProjectsBlob/DeleteProjectItem/${selectedForDelete.ProjectItemID}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchProjectItems();
      } else {
        console.error("Failed to delete project item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedForDelete(null);
    }
  };

  useEffect(() => {
    fetchProjectItems();
  }, [ProjectID]);

  return (
    <div>
      <Button
        className="mb-3"
        size="sm"
        onClick={() => {
          setModalData({
            ProjectItemID: null,
            UserItemID: "",
            QuantityUsed: 1,
          });
          setIsEditing(false);
          setShowModal(true);
        }}
      >
        Add Project Item
      </Button>

      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const matchedItem = availableItems.find(
              (av) => av.UserItemID === item.UserItemID
            );
            return (
              <tr key={item.ProjectItemID}>
                <td>{matchedItem?.ItemName || "Unknown"}</td>
                <td>{item.QuantityUsed}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setModalData(item);
                      setIsEditing(true);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedForDelete(item);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this project item?`}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Project Item" : "Add Project Item"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Item</Form.Label>
              <Form.Control
                as="select"
                value={modalData.UserItemID}
                onChange={(e) =>
                  setModalData({ ...modalData, UserItemID: e.target.value })
                }
              >
                <option value="">Select an Item</option>
                {availableItems.map((item) => (
                  <option key={item.UserItemID} value={item.UserItemID}>
                    {item.ItemName} (Qty: {item.Quantity})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Quantity Used</Form.Label>
              <Form.Control
                type="number"
                value={modalData.QuantityUsed}
                onChange={(e) =>
                  setModalData({ ...modalData, QuantityUsed: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectItems;
