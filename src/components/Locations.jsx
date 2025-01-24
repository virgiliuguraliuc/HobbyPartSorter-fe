import React, { useState, useEffect } from "react";
import { Card, Button, Table } from "react-bootstrap";

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch locations from the API
    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/Items/GetLocations");
            if (!response.ok) throw new Error("Failed to fetch locations");
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    return (
        <div className="container mt-4">
            <Card>
                <Card.Header as="h2" className="text-center">
                    Locations
                </Card.Header>
                <Card.Body>
                    <Button
                        variant="primary"
                        className="mb-3"
                        onClick={fetchLocations}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh Locations"}
                    </Button>
                    <div className="table-responsive">
                        <Table bordered>
                            <thead className="thead-dark">
                                <tr>
                                    <th>Location ID</th>
                                    <th>Location Name</th>
                                    <th>Location Type</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((location) => (
                                    <tr key={location.locationID}>
                                        <td>{location.locationID}</td>
                                        <td>{location.locationName}</td>
                                        <td>{location.locationType || "N/A"}</td>
                                        <td>{location.address || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Locations;
