import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";


const Containers = () => {
    const [containers, setContainers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalData, setModalData] = useState({
        containerID: null,
        containerName: "",
        locationID: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

    const fetchContainers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/Items/GetContainers");
            if (!response.ok) throw new Error("Failed to fetch containers");
            const data = await response.json();
            setContainers(data);
        } catch (error) {
            console.error("Error fetching containers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/Items/GetLocations");
            if (!response.ok) throw new Error("Failed to fetch locations");
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleSave = async () => {
        const url = isEditing
            ? `http://localhost:5000/api/Items/UpdateContainer`
            : `http://localhost:5000/api/Items/AddContainer`;
    
        const method = isEditing ? "PUT" : "POST";
    
        const payload = {
            containerID: isEditing ? modalData.containerID : undefined,
            containerName: modalData.containerName,
            locationID: parseInt(modalData.locationID, 10),
            description: modalData.description,
        };
    
        try {
            await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            fetchContainers();
        } catch (error) {
            console.error("Error saving container:", error);
        } finally {
            setShowModal(false);
        }
    };
    
    

    const handleDelete = async () => {
        if (!selectedForDelete) return;
    
        try {
          await fetch(`http://localhost:5000/api/Items/DeleteContainer/${selectedForDelete.containerID}`, {
            method: "DELETE",
          });
          fetchContainers();
        } catch (error) {
          console.error("Error deleting container:", error);
        } finally {
          setShowDeleteModal(false);
          setselectedForDelete(null);
        }
      };

    const getLocationName = (locationID) => {
        const location = locations.find((loc) => loc.locationID === locationID);
        return location ? location.locationName : "Unknown";
    };

    useEffect(() => {
        fetchContainers();
        fetchLocations();
    }, []);

    return (
        <div className="container mt-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Containers</h4>
              <Button
                onClick={() => {
                  setModalData({
                    containerID: null,
                    containerName: "",
                    locationID: "",
                    description: "",
                  });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                Add Container
              </Button>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <thead className="thead-dark">
                  <tr>
                    <th>Container Name</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => (
                    <tr key={container.containerID}>
                      <td>{container.containerName}</td>
                      <td>{getLocationName(container.locationID)}</td>
                      <td>{container.description}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => {
                                setModalData(container);
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
                                setselectedForDelete(container);
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
          </Card>
    
          {/* Add/Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{isEditing ? "Edit Container" : "Add Container"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Container Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter container name"
                    value={modalData.containerName}
                    onChange={(e) =>
                      setModalData({ ...modalData, containerName: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    value={modalData.locationID}
                    onChange={(e) =>
                      setModalData({ ...modalData, locationID: e.target.value })
                    }
                  >
                    <option value="">Select a location</option>
                    {locations.map((loc) => (
                      <option key={loc.locationID} value={loc.locationID}>
                        {loc.locationName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter description"
                    value={modalData.description}
                    onChange={(e) =>
                      setModalData({ ...modalData, description: e.target.value })
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
    
          {/* Delete Confirmation Modal */}
          <ConfirmationModal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Confirm Deletion"
  message={`Are you sure you want to delete "${selectedForDelete?.containerName}"?`}
/>
        </div>
      );
    };
    

export default Containers;
