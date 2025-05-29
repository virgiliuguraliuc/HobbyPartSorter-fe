import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import ProjectItems from "./ProjectItems";
import Notes from "./Notes";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    ProjectID: null,
    ProjectName: "",
    Description: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${getApiBaseUrl()}/api/ProjectsBlob/GetProjects`);
      const data = await response.json();
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

const fetchAvailableItems = async () => {
  try {
    const response = await authFetch(`${getApiBaseUrl()}/api/UserItemsBlob/GetUserItems`); 
     const data = await response.json(); 
    setAvailableItems(data || []);
  } catch (error) {
    console.error("Error loading user items:", error);
  }
};

  useEffect(() => {
    fetchProjects();
    fetchAvailableItems();
  }, []);

  const handleImageResize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 80;
          let width = img.width;
          let height = img.height;
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
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    const formData = new FormData();
    if (isEditing && modalData.ProjectID !== null) {
      formData.append("projectID", modalData.ProjectID);
    }
    formData.append("projectName", modalData.ProjectName);
    formData.append("description", modalData.Description || "");

    if (modalData.imageFile) {
      const resized = await handleImageResize(modalData.imageFile);
      formData.append("image", resized, modalData.imageFile.name);
    }

    const url = isEditing
      ? `${getApiBaseUrl()}/api/ProjectsBlob/UpdateProject`
      : `${getApiBaseUrl()}/api/ProjectsBlob/AddProject`;

    try {
      const response = await authFetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });
      if (response.ok) {
        fetchProjects();
        setShowModal(false);
      } else {
        console.error("Failed to save project");
      }
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  const handleDelete = async (ProjectID) => {
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/ProjectsBlob/DeleteProject/${ProjectID}`,
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
    <div className="mt-4">
      <Button
        className="mb-3"
        onClick={() => {
          setModalData({
            ProjectID: null,
            ProjectName: "",
            Description: "",
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
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <Card key={project.ProjectID} className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {project.Image && (
                    <img
                      src={`data:image/jpeg;base64,${project.Image}`}
                      alt={project.ProjectName}
                      style={{ width: "80px", height: "80px", marginRight: "15px", borderRadius: "5px" }}
                    />
                  )}
                  <div>
                    <h5>{project.ProjectName}</h5>
                    <p>{project.Description}</p>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                    <Button
                      variant="warning"
                      size="sm"
                      className="mb-2"
                      onClick={() => {
                        setModalData({
                          ProjectID: project.ProjectID,
                          ProjectName: project.ProjectName,
                          Description: project.Description,
                          imageFile: null,
                        });
                        setIsEditing(true);
                        setShowModal(true);
                      }}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Delete Project</Tooltip>}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(project.ProjectID)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {project.ProjectID && (
                <ProjectItems
                  ProjectID={project.ProjectID}
                  availableItems={availableItems}
                />
              )}
              <div className="mt-3">
                <Notes key={project.ProjectID} projectID={project.ProjectID} />
              </div>
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
                value={modalData.ProjectName}
                onChange={(e) =>
                  setModalData({ ...modalData, ProjectName: e.target.value })
                }
              />
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
              <Form.Control
                type="file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setModalData({ ...modalData, imageFile: e.target.files[0] });
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
