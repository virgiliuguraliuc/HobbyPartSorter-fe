import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    CategoryID: null,
    CategoryName: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/categories/GetCategories`
      );
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
      ? `${getApiBaseUrl()}/api/categories/UpdateCategory`
      : `${getApiBaseUrl()}/api/categories/AddCategory`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const payload = isEditing
        ? modalData // Include CategoryID for update
        : { CategoryName: modalData.CategoryName }; // Only send CategoryName for add

      const response = await authFetch(url, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save Category.");
      }

      fetchCategories(); // Refresh categories
    } catch (error) {
      console.error("Error saving Category:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedForDelete) return;

    try {
      await authFetch(
        `${getApiBaseUrl()}/api/categories/DeleteCategory/${selectedForDelete.CategoryID}`,
        {
          method: "DELETE",
        }
      );
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
       <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Categories</h5>
          <div className="d-flex gap-2">
        
            <Button
              onClick={() => {
                setModalData({ CategoryID: null, CategoryName: "" });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              Add Category
            </Button>
                <Button
              variant="outline-secondary"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <i className={`bi ${collapsed ? "bi-chevron-down" : "bi-chevron-up"}`} ></i>
            </Button>
          </div>
        </Card.Header>

        {!collapsed && (
          <Card.Body>
            <Table bordered size="sm" responsive>
              <thead className="thead-dark">
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((Category) => (
                  <tr key={Category.CategoryID}>
                    <td>{Category.CategoryID}</td>
                    <td>{Category.CategoryName}</td>
                     <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                    <div className="d-flex justify-content-end gap-2">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => {
                            setModalData(Category);
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
                            setSelectedForDelete(Category);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        )}
      </Card>
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedForDelete?.CategoryName}?`}
      />

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Category" : "Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category name"
                value={modalData.CategoryName}
                onChange={(e) =>
                  setModalData({ ...modalData, CategoryName: e.target.value })
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
