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
import WebcamCapture from "./WebcamCapture";

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
  const [collapsed, setCollapsed] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/containers/GetContainers`
      );
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
      const response = await authFetch(
        `${getApiBaseUrl()}/api/locations/GetLocations`
      );
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
      ? `${getApiBaseUrl()}/api/containers/UpdateContainer`
      : `${getApiBaseUrl()}/api/containers/AddContainer`;

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
      const video = document.querySelector("video");
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      setPreviewUrl(null); // clear preview on cancel
      setModalData((prev) => ({ ...prev, imageFile: null })); // clear imageFile too
    }
  };

  const handleDelete = async () => {
    if (!selectedForDelete) return;
    try {
      await authFetch(
        `${getApiBaseUrl()}/api/containers/DeleteContainer/${
          selectedForDelete.ContainerID
        }`,
        {
          method: "DELETE",
        }
      );
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = containers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(containers.length / itemsPerPage);

  const [previewUrl, setPreviewUrl] = useState(null);

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Containers</h5>
          <div className="d-flex gap-2">
            <Button
              onClick={() => {
                setModalData({
                  ContainerID: null,
                  ContainerName: "",
                  LocationID: "",
                  Description: "",
                  imageFile: null,
                });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              Add Container
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
            >
              <i
                className={`bi ${
                  collapsed ? "bi-chevron-down" : "bi-chevron-up"
                }`}
              />
            </Button>
          </div>
        </Card.Header>

        {!collapsed && (
          <Card.Body>
            <Table bordered size="sm" responsive>
              <thead>
                <tr>
                  <th className="ps-2">Image</th>
                  <th className="ps-2">Name</th>
                  <th className="ps-2">Location</th>
                  <th className="ps-2">Description</th>
                  <th className="ps-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((container) => (
                  <tr key={container.ContainerID}>
                    <td className="ps-2">
                      {container.Image && (
                        <img
                          src={`data:image/jpeg;base64,${container.Image}`}
                          alt={container.ContainerName}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </td>
                    <td className="ps-2">{container.ContainerName}</td>
                    <td className="ps-2">{getLocationName(container.LocationID)}</td>
                    <td className="ps-2">{container.Description}</td>
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
                              setModalData({ ...container, imageFile: null });
                              setIsEditing(true);
                              setShowModal(true);
                            }}
                          >
                            <i className="fas fa-pencil-alt" />
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
                              setSelectedForDelete(container);
                              setShowDeleteModal(true);
                            }}
                          >
                            <i className="fas fa-trash" />
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
                className="small"
                variant="outline-primary"
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
        onHide={() => {
          setShowModal(false);
          const video = document.querySelector("video");
          if (video && video.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
          }
          setPreviewUrl(null); // optional: reset preview
        }}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedForDelete?.ContainerName}"?`}
      />

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          const video = document.querySelector("video");
          if (video && video.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
          }
          setPreviewUrl(null); // clear preview on cancel
          setModalData((prev) => ({ ...prev, imageFile: null })); // clear imageFile too
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Container" : "Add Container"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Container Name</Form.Label>
            <Form.Control
              type="text"
              value={modalData.ContainerName}
              onChange={(e) =>
                setModalData({ ...modalData, ContainerName: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Location</Form.Label>
            <Form.Select
              value={modalData.LocationID}
              onChange={(e) =>
                setModalData({ ...modalData, LocationID: e.target.value })
              }
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
              onChange={(e) =>
                setModalData({ ...modalData, Description: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Image</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setModalData((prev) => ({ ...prev, imageFile: file }));
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </Form.Group>
          <WebcamCapture
            inline
            onStartCamera={() => {
              setPreviewUrl(null);
              setModalData((prev) => ({ ...prev, imageFile: null }));
            }}
            onCapture={(blob) => {
              if (!blob) {
                console.error("Capture failed — no blob.");
                return;
              }
              const file = new File([blob], "captured.jpg", {
                type: blob.type || "image/jpeg",
              });
              setModalData((prev) => ({ ...prev, imageFile: file }));
              setPreviewUrl(URL.createObjectURL(blob)); // show preview below
            }}
          />

          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "100%", height: "auto", borderRadius: 4 }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              const video = document.querySelector("video");
              if (video && video.srcObject) {
                video.srcObject.getTracks().forEach((track) => track.stop());
              }
              setPreviewUrl(null); // clear preview on cancel
              setModalData((prev) => ({ ...prev, imageFile: null })); // clear imageFile too
            }}
          >
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
export default Containers;
