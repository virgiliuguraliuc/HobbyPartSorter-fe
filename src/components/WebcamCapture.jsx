import React, { useRef, useState } from "react";
import { Button } from "react-bootstrap";

const WebcamCapture = ({ onCapture, onStartCamera, inline }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // rear camera by default mobil

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      } else {
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        }, 50);
      }
      if (onStartCamera) onStartCamera();
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video not ready for capture.");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to capture image from canvas.");
        return;
      }
      onCapture?.(blob);
      stopCamera();
    }, "image/jpeg");
  };

  const toggleFacingMode = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    stopCamera();
    setTimeout(startCamera, 200); // slight delay before restarting ne trebuie timp.
  };

  return (
    <div className="mt-2">
      {!cameraActive && (
        <Button
          variant="outline-secondary"
          onClick={startCamera}
          className={inline ? "ms-auto" : ""}
        >
          <i className="bi bi-camera-fill me-1" />
          Use Camera
        </Button>
      )}

      {cameraActive && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: "5px", marginTop: "10px" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="d-flex flex-wrap gap-2 mt-2">
            <Button variant="primary" onClick={handleCapture}>
              <i className="bi bi-check-circle me-1" />
              Capture
            </Button>
            <Button variant="outline-danger" onClick={stopCamera}>
              Cancel
            </Button>
            <Button variant="outline-secondary" onClick={toggleFacingMode}>
              <i className="bi bi-arrow-repeat me-1" />
              Switch Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
