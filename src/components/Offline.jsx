import React, { useState } from "react";
import { Button, Card, Spinner, Alert } from "react-bootstrap";
import { getApiBaseUrl } from "../utils/config";
import { useNavigate } from "react-router-dom";

const Offline = () => {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkServer = async () => {
    setChecking(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/health`, {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        setError("Server responded, but not OK.");
      }
    } catch (err) {
      setError("Still unreachable. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow-sm" style={{ minWidth: "320px" }}>
        <Card.Body>
          <h4 className="mb-3 text-danger">
            <i className="bi bi-wifi-off me-2"></i> Server Offline
          </h4>
          <p>The server is currently unreachable or wrong adress.Please check your connection or try again.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button onClick={checkServer} disabled={checking} variant="primary" className="w-100">
            {checking ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Checking...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2" />
                Retry
              </>
            )}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Offline;
