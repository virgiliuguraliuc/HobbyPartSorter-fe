import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Card,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const ProjectItems = ({ ProjectID, availableItems }) => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const [modalData, setModalData] = useState({
    ProjectItemID: null,
    UserItemID: "",
    QuantityUsed: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjectItems = async () => {
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/ProjectsBlob/GetProjectItems/${ProjectID}`
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
      ? `${getApiBaseUrl()}/api/ProjectsBlob/UpdateProjectItem`
      : `${getApiBaseUrl()}/api/ProjectsBlob/AddProjectItem`;

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
        `${getApiBaseUrl()}/api/ProjectsBlob/DeleteProjectItem/${
          selectedForDelete.ProjectItemID
        }`,
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

    const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = items.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Project Items</h5>
        {/* <div className="row"> */}
          <div className="d-flex justify-content-between align-items-center gap-2">
            <Button
             
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
            <Button
              variant="outline-secondary"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <i
                className={`bi ${
                  collapsed ? "bi-chevron-down" : "bi-chevron-up"
                }`}
              ></i>
            </Button>
          {/* </div> */}
</div>
        </Card.Header>

        {!collapsed && (
          <Card.Body>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th className="ps-2">Item Name</th>
                  <th className="ps-2">Quantity Used</th>
                  <th className="ps-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => {
                  const matchedItem = availableItems.find(
                    (av) => av.UserItemID === item.UserItemID
                  );
                  return (
                    <tr key={item.ProjectItemID}>
                      <td className="ps-2">{matchedItem?.ItemName || "Unknown"}</td>
                          <td className="text-end" style={{ width: "1%", whiteSpace: "wrap" }}>{item.QuantityUsed}</td>
                      <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-end gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              variant="warning"
                              size="sm"
                              className=""
                              onClick={() => {
                                setModalData(item);
                                setIsEditing(true);
                                setShowModal(true);
                              }}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedForDelete(item);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="d-flex justify-content-end align-items-center mt-2 gap-2">
  <Form.Select
    size="sm"
    style={{ width: "auto" }}
    value={itemsPerPage}
    onChange={(e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1);
    }}
  >
    <option value={5}>5 per page</option>
    <option value={10}>10 per page</option>
    <option value={25}>25 per page</option>
    <option value={50}>50 per page</option>
  </Form.Select>
  <Button
    size="sm"
    variant="outline-primary"
    className="small"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => prev - 1)}
  >
    &lt; Prev
  </Button>
  <span className="small">
    Page {currentPage} of {totalPages}
  </span>
  <Button
    size="sm"
    className="small"
    variant="outline-primary"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((prev) => prev + 1)}
  >
    Next &gt;
  </Button>
</div>

          </Card.Body>
        )}
      </Card>

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
