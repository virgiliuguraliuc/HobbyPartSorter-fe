import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ categoryID: null, categoryName: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  
  
  const [isEditing, setIsEditing] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/Items/GetCategories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const url = isEditing
      ? `http://localhost:5000/api/Items/UpdateCategory`
      : `http://localhost:5000/api/Items/AddCategory`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const payload = isEditing
        ? modalData // Include categoryID for update
        : { categoryName: modalData.categoryName }; // Only send categoryName for add

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save category.");
      }

      fetchCategories(); // Refresh categories
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedForDelete) return;
  
    try {
      await fetch(`http://localhost:5000/api/Items/DeleteCategory/${selectedForDelete.categoryID}`, {
        method: "DELETE",
      });
      fetchCategories();
    } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setShowDeleteModal(false);
        setSelectedForDelete(null);
      }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Categories</h4>
          <Button
            onClick={() => {
              setModalData({ categoryID: null, categoryName: "" });
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            Add Category
          </Button>
        </Card.Header>
        <Card.Body>
          <Table bordered>
            <thead className="thead-dark">
              <tr>
                <th>Category ID</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.categoryID}>
                  <td>{category.categoryID}</td>
                  <td>{category.categoryName}</td>

                  <td className="d-flex justify-content-end gap-2">
                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => {
                          setModalData(category);
                          setIsEditing(true);
                          setShowModal(true);
                        }}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                  <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedForDelete(category); // Set the selected item for delete
                                  setShowDeleteModal(true); // Show the confirmation modal
                                }}
                              >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </OverlayTrigger>
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <ConfirmationModal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Confirm Deletion"
  message={`Are you sure you want to delete ${selectedForDelete?.categoryName}?`}
/>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={modalData.categoryName}
                onChange={(e) =>
                  setModalData({ ...modalData, categoryName: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;
