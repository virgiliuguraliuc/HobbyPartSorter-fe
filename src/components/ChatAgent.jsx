import React, { useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { getApiBaseUrl } from "../utils/config";
import { authFetch } from "../utils/authFetch";

const ChatAgent = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await authFetch(`${getApiBaseUrl()}/api/chat-agent`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Request failed");
      }

      const data = await res.json();

      const reply = data.response;
      setHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "agent", content: reply },
      ]);
      setResponse(reply);
      setMessage("");
    } catch (err) {
      console.error("Chat agent error:", err);
      setResponse("Error: Could not get a response from the agent.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5 className="mb-0">Smart Agent</h5>
      </Card.Header>
      <Card.Body>
        <div
          className="chat-window"
          style={{
            maxHeight: "250px",
            overflowY: "auto",
            marginBottom: "1rem",
          }}
        >
          {history.map((entry, index) => (
            <div
              key={index}
              className={`mb-2 ${
                entry.role === "user" ? "text-end" : "text-start"
              }`}
            >
              <span className="fw-bold">
                {entry.role === "user" ? "You" : "Agent"}:
              </span>{" "}
              {entry.content}
            </div>
          ))}
        </div>
        <Form.Control
          as="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={3}
          placeholder="Type your message here..."
          className="mb-2"
        />
        <div className="d-flex justify-content-end">
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Send"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ChatAgent;
