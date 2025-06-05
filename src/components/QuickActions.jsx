import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import WebcamCapture from "./WebcamCapture";
import { authFetch } from "../utils/authFetch";
import { getApiBaseUrl } from "../utils/config";

const QuickActions = () => {
  //locations
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState({
    LocationName: "",
    Description: "",
  });
  //container
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [containerData, setContainerData] = useState({
    ContainerName: "",
    LocationID: "",
    Description: "",
    imageFile: null,
  });
  const [locations, setLocations] = useState([]);
  const [containerPreviewUrl, setContainerPreviewUrl] = useState(null);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await authFetch(
          `${getApiBaseUrl()}/api/locations/GetLocations`
        );
        const data = await response.json();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);
  //items
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemData, setItemData] = useState({
    ItemName: "",
    CategoryID: "",
    ContainerID: "",
    Description: "",
    Quantity: 1,
    Weight: 0,
    Price: 0,
    imageFile: null,
  });
  const [categories, setCategories] = useState([]);
  const [containers, setContainers] = useState([]);
  const [itemPreviewUrl, setItemPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, conRes, locRes] = await Promise.all([
          authFetch(`${getApiBaseUrl()}/api/categories/GetCategories`),
          authFetch(`${getApiBaseUrl()}/api/containers/GetContainers`),
          authFetch(`${getApiBaseUrl()}/api/locations/GetLocations`),
        ]);
        setCategories(await catRes.json());
        setContainers(await conRes.json());
        setLocations(await locRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  //add category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryData, setCategoryData] = useState({
    CategoryName: "",
    Description: "",
  });

  //container and image
  const handleImageResize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 80;
          let { width, height } = img;
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), file.type || "image/jpeg");
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const cleanupModal = (setModalState, defaultState, setPreviewUrl) => {
    const video = document.querySelector("video");
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setPreviewUrl && setPreviewUrl(null);
    setModalState(defaultState);
  };

  const handleSaveLocation = async () => {
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/locations/AddLocation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        }
      );

      if (!response.ok) throw new Error("Failed to save location");

      setShowLocationModal(false);
      setLocationData({ LocationName: "", Description: "" });
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleSaveContainer = async () => {
    const formData = new FormData();
    formData.append("containerName", containerData.ContainerName);
    formData.append("locationID", containerData.LocationID);
    formData.append("description", containerData.Description || "");

    if (containerData.imageFile) {
      const resized = await handleImageResize(containerData.imageFile);
      formData.append("image", resized, containerData.imageFile.name);
    }

    try {
      await authFetch(`${getApiBaseUrl()}/api/containers/AddContainer`, {
        method: "POST",
        body: formData,
      });
      setShowContainerModal(false);
      setContainerData({
        ContainerName: "",
        LocationID: "",
        Description: "",
        imageFile: null,
      });
      setContainerPreviewUrl(null);
    } catch (err) {
      console.error("Error saving container:", err);
    }
  };

  const handleSaveItem = async () => {
    const formData = new FormData();
    Object.entries(itemData).forEach(([key, value]) => {
      if (key === "imageFile" && value) return; // handle below
      formData.append(key, value);
    });

    if (itemData.imageFile) {
      const resized = await handleImageResize(itemData.imageFile);
      formData.append("image", resized, itemData.imageFile.name);
    }

    try {
      await authFetch(`${getApiBaseUrl()}/api/items/AddItem`, {
        method: "POST",
        body: formData,
      });
      setShowItemModal(false);
      setItemData({
        ItemName: "",
        CategoryID: "",
        ContainerID: "",
        Description: "",
        Quantity: 1,
        Weight: 0,
        Price: 0,
        imageFile: null,
      });
      setItemPreviewUrl(null);
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleSaveCategory = async () => {
    try {
      await authFetch(`${getApiBaseUrl()}/api/categories/AddCategory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      setShowCategoryModal(false);
      setCategoryData({
        CategoryName: "",
        Description: "",
      });
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  return (
    <>
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-2">
            <Col xs={6} md={3}>
              <Button
                className="w-100"
                onClick={() => setShowLocationModal(true)}
              >
                <i className="bi bi-geo-alt-fill me-1"></i>
                Add Location
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button
                className="w-100"
                onClick={() => setShowContainerModal(true)}
              >
                <i className="bi bi-box-fill me-1"></i>
                Add Container
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button
                className="w-100"
                onClick={() => setShowCategoryModal(true)}
              >
                <i className="bi bi-tags-fill me-1"></i>
                Add Category
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button className="w-100" onClick={() => setShowItemModal(true)}>
                <i className="bi bi-plus-square-fill me-1"></i>
                Add Item
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Modal
        show={showLocationModal}
        onHide={() => setShowLocationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Location Name</Form.Label>
            <Form.Control
              type="text"
              value={locationData.LocationName}
              onChange={(e) =>
                setLocationData({
                  ...locationData,
                  LocationName: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={locationData.Description}
              onChange={(e) =>
                setLocationData({
                  ...locationData,
                  Description: e.target.value,
                })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLocationModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveLocation}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showContainerModal}
        onHide={() =>
          cleanupModal(setShowContainerModal, false, setContainerPreviewUrl)
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Container</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Container Name</Form.Label>
            <Form.Control
              type="text"
              value={containerData.ContainerName}
              onChange={(e) =>
                setContainerData({
                  ...containerData,
                  ContainerName: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Location</Form.Label>
            <Form.Select
              value={containerData.LocationID}
              onChange={(e) =>
                setContainerData({
                  ...containerData,
                  LocationID: e.target.value,
                })
              }
            >
              <option value="">Select a location</option>
              {locations.map((loc) => (
                <option key={loc.LocationID} value={loc.LocationID}>
                  {loc.LocationName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={containerData.Description}
              onChange={(e) =>
                setContainerData({
                  ...containerData,
                  Description: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Image</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setContainerData((prev) => ({ ...prev, imageFile: file }));
                    setContainerPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </Form.Group>
          <WebcamCapture
            inline
            onStartCamera={() => {
              setContainerPreviewUrl(null);
              setContainerData((prev) => ({ ...prev, imageFile: null }));
            }}
            onCapture={(blob) => {
              if (!blob) return;
              const file = new File([blob], "captured.jpg", {
                type: blob.type || "image/jpeg",
              });
              setContainerData((prev) => ({ ...prev, imageFile: file }));
              setContainerPreviewUrl(URL.createObjectURL(blob));
            }}
          />
          {containerPreviewUrl && (
            <div className="mt-2">
              <img
                src={containerPreviewUrl}
                alt="Preview"
                style={{ maxWidth: "100%", height: "auto", borderRadius: 4 }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              cleanupModal(setShowContainerModal, false, setContainerPreviewUrl)
            }
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveContainer}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showItemModal}
        onHide={() => cleanupModal(setShowItemModal, false, setItemPreviewUrl)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              value={itemData.ItemName}
              onChange={(e) =>
                setItemData({ ...itemData, ItemName: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={itemData.CategoryID}
              onChange={(e) =>
                setItemData({ ...itemData, CategoryID: e.target.value })
              }
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.CategoryID} value={cat.CategoryID}>
                  {cat.CategoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Container</Form.Label>
            <Form.Select
              value={itemData.ContainerID}
              onChange={(e) =>
                setItemData({ ...itemData, ContainerID: e.target.value })
              }
            >
              <option value="">Select a container</option>
              {containers.map((con) => (
                <option key={con.ContainerID} value={con.ContainerID}>
                  {con.ContainerName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={itemData.Description}
              onChange={(e) =>
                setItemData({ ...itemData, Description: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={itemData.Quantity}
              onChange={(e) =>
                setItemData({ ...itemData, Quantity: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Weight</Form.Label>
            <Form.Control
              type="number"
              value={itemData.Weight}
              onChange={(e) =>
                setItemData({ ...itemData, Weight: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={itemData.Price}
              onChange={(e) =>
                setItemData({ ...itemData, Price: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setItemData((prev) => ({ ...prev, imageFile: file }));
                  setItemPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </Form.Group>
          <WebcamCapture
            inline
            onStartCamera={() => {
              setItemPreviewUrl(null);
              setItemData((prev) => ({ ...prev, imageFile: null }));
            }}
            onCapture={(blob) => {
              if (!blob) return;
              const file = new File([blob], "captured.jpg", {
                type: blob.type || "image/jpeg",
              });
              setItemData((prev) => ({ ...prev, imageFile: file }));
              setItemPreviewUrl(URL.createObjectURL(blob));
            }}
          />
          {itemPreviewUrl && (
            <div className="mt-2">
              <img
                src={itemPreviewUrl}
                alt="Preview"
                style={{ maxWidth: "100%", height: "auto", borderRadius: 4 }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              cleanupModal(setShowItemModal, false, setItemPreviewUrl)
            }
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={categoryData.CategoryName}
              onChange={(e) =>
                setCategoryData({
                  ...categoryData,
                  CategoryName: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={categoryData.Description}
              onChange={(e) =>
                setCategoryData({
                  ...categoryData,
                  Description: e.target.value,
                })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCategoryModal(false);
              setCategoryData({ CategoryName: "", Description: "" });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuickActions;
