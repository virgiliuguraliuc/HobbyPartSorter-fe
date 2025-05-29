import React, { useEffect, useState } from "react";
import { Spinner, ListGroup, Card, Badge } from "react-bootstrap";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const Summary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    projectCount: 0,
    itemStats: { total: 0, weight: 0, value: 0 },
    locationTree: [],
    looseItems: [],
  });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();

      const [
        projectsRes,
        userItemsRes,
        allItemsRes,
        containersRes,
        locationsRes,
        itemLocationsRes,
      ] = await Promise.all([
        authFetch(`${baseUrl}/api/ProjectsBlob/GetProjects`),
        authFetch(`${baseUrl}/api/UserItemsBlob/GetUserItems`),
        authFetch(`${baseUrl}/api/ItemsBlob/GetItems`),
        authFetch(`${baseUrl}/api/containers/GetContainers`),
        authFetch(`${baseUrl}/api/locations/GetLocations`),
        authFetch(`${baseUrl}/api/item_locations/GetItemLocations`),
      ]);

      const projects = await projectsRes.json();
      const userItems = await userItemsRes.json();
      const allItems = await allItemsRes.json();
      const containers = await containersRes.json();
      const locations = await locationsRes.json();
      const itemLocations = await itemLocationsRes.json();

      const enrichedItems = userItems.map((uItem) => {
        const fullItem = allItems.find((i) => i.ItemID === uItem.ItemID) || {};
        return {
          ...uItem,
          ...fullItem,
        };
      });

      const itemStats = {
        total: enrichedItems.length,
        weight: enrichedItems.reduce((acc, item) => acc + (item.Weight || 0), 0),
        value: enrichedItems.reduce((acc, item) => acc + (item.Price || 0), 0),
      };

      const containerMap = {};
      itemLocations.forEach((link) => {
        if (!containerMap[link.ContainerID]) {
          containerMap[link.ContainerID] = [];
        }
        containerMap[link.ContainerID].push(link.ItemID);
      });

      const looseItems = enrichedItems.filter(
        (item) => !Object.values(containerMap).some((ids) => ids.includes(item.ItemID))
      );

      const locationTree = locations.map((loc) => {
        const containersInLoc = containers.filter(
          (c) => c.LocationID === loc.LocationID
        );

        const containersWithStats = containersInLoc.map((cont) => {
          const itemIDsInContainer = containerMap[cont.ContainerID] || [];
          const itemsInContainer = enrichedItems.filter((item) =>
            itemIDsInContainer.includes(item.ItemID)
          );

          return {
            ...cont,
            items: itemsInContainer,
            itemCount: itemsInContainer.length,
            totalWeight: itemsInContainer.reduce((a, i) => a + (i.Weight || 0), 0),
            totalValue: itemsInContainer.reduce((a, i) => a + (i.Price || 0), 0),
          };
        });

        return { ...loc, containers: containersWithStats };
      });

      setSummary({
        projectCount: projects.length,
        itemStats,
        locationTree,
        looseItems,
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <Spinner animation="border" />;

  const looseItemStats = {
    count: summary.looseItems.length,
    totalWeight: summary.looseItems.reduce((a, i) => a + (i.Weight || 0), 0),
    totalValue: summary.looseItems.reduce((a, i) => a + (i.Price || 0), 0),
  };

  return (
    <div className="mt-3">
      <div className="d-flex flex-wrap gap-3 mb-4">
        <Card className="flex-fill shadow-sm" style={{ minWidth: "250px" }}>
          <Card.Body>
            <h6><i className="bi bi-kanban-fill me-2"></i>Total Projects</h6>
            <h4>{summary.projectCount}</h4>
          </Card.Body>
        </Card>

        <Card className="flex-fill shadow-sm" style={{ minWidth: "250px" }}>
          <Card.Body>
            <h6><i className="bi bi-box-seam me-2"></i>Total Items</h6>
            <h4>{summary.itemStats.total}</h4>
          </Card.Body>
        </Card>

        <Card className="flex-fill shadow-sm" style={{ minWidth: "250px" }}>
          <Card.Body>
            <h6><i className="bi bi-bar-chart me-2"></i>Total Weight</h6>
            <h4>{summary.itemStats.weight.toFixed(2)} g</h4>
          </Card.Body>
        </Card>

        <Card className="flex-fill shadow-sm" style={{ minWidth: "250px" }}>
          <Card.Body>
            <h6><i className="bi bi-currency-dollar me-2"></i>Total Value</h6>
            <h4>${summary.itemStats.value.toFixed(2)}</h4>
          </Card.Body>
        </Card>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Header><i className="bi bi-exclamation-circle me-2"></i> Unstored Items</Card.Header>
        <Card.Body>
          {summary.looseItems.length > 0 ? (
            <ul className="mb-0">
              <li>Count: <Badge bg="secondary">{looseItemStats.count}</Badge></li>
              <li>Total Weight: <Badge bg="secondary">{looseItemStats.totalWeight.toFixed(2)} g</Badge></li>
              <li>Total Value: <Badge bg="secondary">${looseItemStats.totalValue.toFixed(2)}</Badge></li>
            </ul>
          ) : (
            <p>All items are assigned to containers.</p>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header><i className="bi bi-geo-alt-fill me-2"></i>Location Overview</Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {summary.locationTree.map((loc) => (
              <ListGroup.Item key={loc.LocationID}>
                <strong>{loc.LocationName}</strong>
                <ul className="ms-3">
                  {loc.containers.map((cont) => (
                    <li key={cont.ContainerID}>
                      <i className="bi bi-box-fill me-1 text-primary"></i>
                      <strong>{cont.ContainerName}</strong>:{" "}
                      <Badge className="me-2">{cont.itemCount} items</Badge>
                      <Badge className="me-2">{cont.totalWeight.toFixed(2)} g</Badge>
                      <Badge>${cont.totalValue.toFixed(2)}</Badge>
                    </li>
                  ))}
                </ul>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Summary;
