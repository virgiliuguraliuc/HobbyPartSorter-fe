import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form } from "react-bootstrap";

const Containers = () => {
    const [containers, setContainers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        containerID: null,
        containerName: "",
        locationID: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);

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
    
    

    const handleDelete = async (containerID) => {
        try {
            await fetch(`http://localhost:5000/api/Items/DeleteContainer/${containerID}`, {
                method: "DELETE",
            });
            fetchContainers();
        } catch (error) {
            console.error("Error deleting container:", error);
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
                <Card.Header>
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
                                <th>Container ID</th>
                                <th>Container Name</th>
                                <th>Location</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {containers.map((container) => (
                                <tr key={container.containerID}>
                                    <td>{container.containerID}</td>
                                    <td>{container.containerName}</td>
                                    <td>{getLocationName(container.locationID)}</td>
                                    <td>{container.description}</td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => {
                                                setModalData(container);
                                                setIsEditing(true);
                                                setShowModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>{" "}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(container.containerID)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal */}
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
        </div>
    );
};

export default Containers;
