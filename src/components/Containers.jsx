import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal";
import { authFetch } from "../utils/authFetch";

const Containers = () => {
  const [containers, setContainers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalData, setModalData] = useState({
    ContainerID: null,
    ContainerName: "",
    LocationID: "",
    Description: "",
    imageFile: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const response = await authFetch("http://localhost:5000/api/containers/GetContainers");
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
      const response = await authFetch("http://localhost:5000/api/locations/GetLocations");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleImageResize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 80;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height * maxDim) / width;
              width = maxDim;
            } else {
              width = (width * maxDim) / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), file.type || "image/jpeg");
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    const formData = new FormData();
    if (isEditing && modalData.ContainerID !== null) {
      formData.append("containerID", modalData.ContainerID);
    }
    formData.append("containerName", modalData.ContainerName);
    formData.append("locationID", modalData.LocationID);
    formData.append("description", modalData.Description || "");

    if (modalData.imageFile) {
      const resized = await handleImageResize(modalData.imageFile);
      formData.append("image", resized, modalData.imageFile.name);
    }

    const url = isEditing
      ? "http://localhost:5000/api/containers/UpdateContainer"
      : "http://localhost:5000/api/containers/AddContainer";

    const method = isEditing ? "PUT" : "POST";

    try {
      await authFetch(url, {
        method,
        body: formData,
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
      await authFetch(`http://localhost:5000/api/containers/DeleteContainer/${selectedForDelete.ContainerID}`, {
        method: "DELETE",
      });
      fetchContainers();
    } catch (error) {
      console.error("Error deleting container:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedForDelete(null);
    }
  };

  const getLocationName = (LocationID) => {
    const location = locations.find((loc) => loc.LocationID === LocationID);
    return location ? location.LocationName : "Unknown";
  };

  useEffect(() => {
    fetchContainers();
    fetchLocations();
  }, []);

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Containers</h4>
          <Button onClick={() => {
            setModalData({
              ContainerID: null,
              ContainerName: "",
              LocationID: "",
              Description: "",
              imageFile: null,
            });
            setIsEditing(false);
            setShowModal(true);
          }}>
            Add Container
          </Button>
        </Card.Header>
        <Card.Body>
          <Table bordered>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Location</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.ContainerID}>
                  <td>
                    {container.Image && (
                      <img
                        src={`data:image/jpeg;base64,${container.Image}`}
                        alt={container.ContainerName}
                        style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                      />
                    )}
                  </td>
                  <td>{container.ContainerName}</td>
                  <td>{getLocationName(container.LocationID)}</td>
                  <td>{container.Description}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => {
                            setModalData({ ...container, imageFile: null });
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
                            setSelectedForDelete(container);
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
                value={modalData.ContainerName}
                onChange={(e) => setModalData({ ...modalData, ContainerName: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Select
                value={modalData.LocationID}
                onChange={(e) => setModalData({ ...modalData, LocationID: e.target.value })}
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.LocationID} value={loc.LocationID}>
                    {loc.LocationName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={modalData.Description}
                onChange={(e) => setModalData({ ...modalData, Description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setModalData({ ...modalData, imageFile: e.target.files[0] })}
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

      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedForDelete?.ContainerName}"?`}
      />
    </div>
  );
};

export default Containers;
