import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import ProjectItems from "./ProjectItems";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [availableItems, setAvailableItems] = useState([]); // Ensure it's initialized as an empty array
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  const [modalData, setModalData] = useState({
    projectID: null,
    projectName: "",
    description: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ProjectsBlob/GetProjects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available items for Project Items dropdown
  const fetchAvailableItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/ItemsBlob/GetItems");
      const data = await response.json();
      setAvailableItems(data || []); // Ensure data is an array
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchAvailableItems();
  }, []);

  // Function to resize image
  const handleImageResize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDimension = 80;

          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, file.type || "image/jpeg");
        };

        img.onerror = (error) => reject(error);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  // Handle save function
  const handleSave = async () => {
    const formData = new FormData();

    if (isEditing) {
      formData.append("projectID", modalData.projectID);
    }

    formData.append("projectName", modalData.projectName);
    formData.append("description", modalData.description);
    formData.append("userID", 1);

    if (modalData.imageFile) {
      const resizedImage = await handleImageResize(modalData.imageFile);
      formData.append("image", resizedImage, modalData.imageFile.name);
    }

    const url = isEditing
      ? "http://localhost:5000/api/ProjectsBlob/UpdateProject"
      : "http://localhost:5000/api/ProjectsBlob/AddProject";

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        fetchProjects();
        setShowModal(false);
      } else {
        console.error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (projectID) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ProjectsBlob/DeleteProject/${projectID}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchProjects();
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="container mt-4">
      <Button
        className="mb-3"
        onClick={() => {
          setModalData({
            projectID: null,
            projectName: "",
            description: "",
            imageFile: null,
          });
          setIsEditing(false);
          setShowModal(true);
        }}
      >
        Add Project
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        projects.map((project) => (
          <Card key={project.projectID} className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {project.image && (
                    <img
                      src={`data:image/jpeg;base64,${project.image}`}
                      alt={project.projectName}
                      style={{
                        width: "80px",
                        height: "80px",
                        marginRight: "15px",
                        borderRadius: "5px",
                      }}
                    />
                  )}
                  <div>
                    <h5>{project.projectName}</h5>
                    <p>{project.description}</p>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <Button
                      variant="warning"
                      size="sm"
                      className="mb-2"
                      onClick={() => {
                        setModalData({
                          projectID: project.projectID,
                          projectName: project.projectName,
                          description: project.description,
                          imageFile: null,
                        });
                        setIsEditing(true);
                        setShowModal(true);
                      }}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Delete Project</Tooltip>}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(project.projectID)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <ProjectItems
                projectID={project.projectID}
                availableItems={availableItems}
              />
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Project" : "Add Project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                value={modalData.projectName}
                onChange={(e) =>
                  setModalData({ ...modalData, projectName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={modalData.description}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setModalData({
                      ...modalData,
                      imageFile: e.target.files[0],
                    });
                  }
                }}
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

export default Projects;
