import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";

const ProjectItems = ({ projectID, availableItems }) => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    projectItemID: null,
    userItemID: "",
    quantityUsed: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjectItems = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ProjectsBlob/GetProjectItems/${projectID}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error loading project items:", error);
    }
  };

  const handleSave = async () => {
    const payload = {
        projectItemID: modalData.projectItemID || null, // Include if editing
        projectID,
        userItemID: modalData.userItemID,
        quantityUsed: parseInt(modalData.quantityUsed, 10),
    };

    const url = isEditing
        ? `http://localhost:5000/api/ProjectsBlob/UpdateProjectItem`
        : `http://localhost:5000/api/ProjectsBlob/AddProjectItem`;

    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
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


  const handleDelete = async (projectItemID) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ProjectsBlob/DeleteProjectItem/${projectItemID}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchProjectItems();
      } else {
        console.error("Failed to delete project item");
      }
    } catch (error) {
      console.error("Error deleting project item:", error);
    }
  };

  useEffect(() => {
    fetchProjectItems();
  }, []);

  return (
    <div>
      <Button
        className="mb-3"
        size="sm"
        onClick={() => {
          setModalData({
            projectItemID: null,
            userItemID: "",
            quantityUsed: 1,
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
          {items.map((item) => (
            <tr key={item.projectItemID}>
              <td>
                {
                  availableItems.find((availableItem) => availableItem.itemID === item.userItemID)
                    ?.itemName
                }
              </td>
              <td>{item.quantityUsed}</td>
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
                  onClick={() => handleDelete(item.projectItemID)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for adding/editing project items */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Project Item" : "Add Project Item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Item</Form.Label>
              <Form.Control
                as="select"
                value={modalData.userItemID}
                onChange={(e) => setModalData({ ...modalData, userItemID: e.target.value })}
              >
                <option value="">Select an Item</option>
                {availableItems.map((item) => (
                  <option key={item.itemID} value={item.itemID}>
                    {item.itemName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Quantity Used</Form.Label>
              <Form.Control
                type="number"
                value={modalData.quantityUsed}
                onChange={(e) => setModalData({ ...modalData, quantityUsed: e.target.value })}
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
