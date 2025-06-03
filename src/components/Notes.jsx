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

const Notes = ({ projectID = null }) => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [modalData, setModalData] = useState({
    TaskID: null,
    ProjectID: projectID || "",
    Note: "",
    Complete: false,
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${getApiBaseUrl()}/api/notes/GetNotes`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const allNotes = await res.json();
      const filtered = projectID
        ? allNotes.filter((note) => note.ProjectID === projectID)
        : allNotes;
      setNotes(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await authFetch(
        `${getApiBaseUrl()}/api/ProjectsBlob/GetProjects`
      );
      if (!res.ok) throw new Error("Failed to fetch projects");
      setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const url = isEditing
      ? `${getApiBaseUrl()}/api/notes/UpdateNote/${modalData.TaskID}`
      : `${getApiBaseUrl()}/api/notes/AddNote`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const payload = {
        ProjectID: projectID || modalData.ProjectID,
        Note: modalData.Note,
        Complete: modalData.Complete,
      };

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      await authFetch(
        `${getApiBaseUrl()}/api/notes/DeleteNote/${selectedForDelete.TaskID}`,
        { method: "DELETE" }
      );
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setSelectedForDelete(null);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchProjects();
  }, [projectID]);

  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(5);

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const paginated = notes.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(notes.length / itemsPerPage);


  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Notes</h5>
          <div className="d-flex gap-2">
            <Button
              onClick={() => {
                setModalData({
                  TaskID: null,
                  ProjectID: projectID || "",
                  Note: "",
                  Complete: false,
                });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              Add Note
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
                  <th>Note</th>
                  {!projectID && <th>Project</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((note) => {
                  const project = projects.find(
                    (p) => p.ProjectID === note.ProjectID
                  );
                  return (
                    <tr key={note.TaskID}>
                      <td>{note.Note}</td>
                      {!projectID && (
                        <td>{project?.ProjectName || "Unknown"}</td>
                      )}
                      <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                        {note.Complete ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : (
                          <i className="bi bi-hourglass-split text-warning"></i>
                        )}
                      </td>
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
                                setModalData(note);
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
                                setSelectedForDelete(note);
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
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => prev - 1)}
  >
    &lt; Prev
  </Button>
  <span>
    Page {currentPage} of {totalPages}
  </span>
  <Button
    size="sm"
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
        message={`Are you sure you want to delete this note?`}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Note" : "Add Note"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {!projectID && (
              <Form.Group>
                <Form.Label>Project</Form.Label>
                <Form.Select
                  value={modalData.ProjectID}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      ProjectID: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.ProjectID} value={project.ProjectID}>
                      {project.ProjectName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mt-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                type="text"
                value={modalData.Note}
                onChange={(e) =>
                  setModalData({ ...modalData, Note: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Complete"
                checked={modalData.Complete}
                onChange={(e) =>
                  setModalData({ ...modalData, Complete: e.target.checked })
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

export default Notes;
