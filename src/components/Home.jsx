import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { getAiBaseUrl } from "../utils/config";
import { getApiBaseUrl } from "../utils/config";

const Home = () => {
  const [collapsed, setCollapsed] = useState({
    summary: false,
    notes: false,
    helper: false,
  });

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="mt-4">
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Summary</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("summary")}
          >
            <i
              className={`bi ${
                collapsed.summary ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.summary && (
          <Card.Body>
            <p>This section provides a quick overview of your inventory, stats, and recent changes.</p>
          </Card.Body>
        )}
      </Card>

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Notes</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("notes")}
          >
            <i
              className={`bi ${
                collapsed.notes ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.notes && (
          <Card.Body>
            <p>You can write down ideas, part numbers, or upcoming tasks here.</p>
          </Card.Body>
        )}
      </Card>

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Hobby Helper</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("helper")}
          >
            <i
              className={`bi ${
                collapsed.helper ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.helper && (
          <Card.Body>
            <p>AI suggestions, calculations, or part compatibility helpers will appear here.</p>
          </Card.Body>
        )}
      </Card>
    </div>
  );
};

export default Home;
