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

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [modalData, setModalData] = useState({
    LocationID: null,
    LocationName: "",
    LocationType: "",
    Address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(locations.length / itemsPerPage);
  const paginatedLocations = locations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/locations/GetLocations`
      );
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const url = isEditing
      ? `${getApiBaseUrl()}/api/locations/UpdateLocation`
      : `${getApiBaseUrl()}/api/locations/AddLocation`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalData),
      });

      if (response.ok) {
        fetchLocations();
        setShowModal(false);
      } else {
        console.error("Failed to save location");
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/locations/DeleteLocation/${
          selectedForDelete.LocationID
        }`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchLocations();
      } else {
        console.error("Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);
  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Locations</h5>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setModalData({
                  LocationID: null,
                  LocationName: "",
                  LocationType: "",
                  Address: "",
                });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              Add Location
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
          </div>
        </Card.Header>

        {!collapsed && (
          <Card.Body>
            <Table bordered size="sm" responsive>
              <thead>
                <tr>
                  <th className="ps-2">Name</th>
                  <th className="ps-2">Type</th>
                  <th className="ps-2">Address</th>
                  <th className="ps-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLocations.map((location) => (
                  <tr key={location.LocationID}>
                    <td className="ps-2">{location.LocationName}</td>
                    <td className="ps-2">{location.LocationType || "N/A"}</td>
                    <td className="ps-2">{location.Address || "N/A"}</td>
                    <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                      <div className="d-flex justify-content-end gap-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setModalData(location);
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
                              setSelectedForDelete(location);
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

            <div className="d-flex justify-content-end align-items-center mt-2 gap-2">
              <Form.Select
                size="sm"
                // className="small"
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
              </Button >
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Location" : "Add Location"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Location Name</Form.Label>
              <Form.Control
                type="text"
                value={modalData.LocationName}
                onChange={(e) =>
                  setModalData({ ...modalData, LocationName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Location Type</Form.Label>
              <Form.Control
                type="text"
                value={modalData.LocationType}
                onChange={(e) =>
                  setModalData({ ...modalData, LocationType: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={modalData.Address}
                onChange={(e) =>
                  setModalData({ ...modalData, Address: e.target.value })
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedForDelete?.LocationName}"?`}
      />
    </div>
  );
};

export default Locations;
