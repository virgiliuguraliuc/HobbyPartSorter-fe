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

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [modalData, setModalData] = useState({
    itemID: null,
    itemName: "",
    categoryID: "",
    weight: "",
    price: "",
    description: "",
    imageFile: null,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch items and categories
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/ItemsBlob/GetItems"
      );
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/ItemsBlob/GetCategories"
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Resize image before upload
  const handleImageResize = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDimension = 80;

          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, file.type || "image/jpeg");
        };

        img.onerror = (error) => reject(error);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  // Save item (add or update)
  const handleSave = async () => {
    const url = isEditing
      ? "http://localhost:5000/api/ItemsBlob/UpdateItem"
      : "http://localhost:5000/api/ItemsBlob/AddItem";
    const method = isEditing ? "PUT" : "POST";
  
    try {
      const formData = new FormData();
      if (isEditing) {
        formData.append("itemID", modalData.itemID); //cum sa il uiti
      }
      formData.append("itemName", modalData.itemName);
      formData.append("categoryID", modalData.categoryID);
      formData.append("weight", modalData.weight);
      formData.append("price", modalData.price);
      formData.append("description", modalData.description);
      formData.append("userID", 1); // Hardcoded user ID
  
      if (modalData.imageFile) {
        const resizedImage = await handleImageResize(modalData.imageFile);
        formData.append("image", resizedImage, modalData.imageFile.name);
      }
  
      const response = await fetch(url, {
        method,
        body: formData,
      });
  
      if (response.ok) {
        fetchItems();
        setShowModal(false);
      } else {
        console.error("Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };
  

  // Delete item

  const handleDeleteConfirm = async () => {
    if (!selectedForDelete) return;

    try {
      await fetch(
        `http://localhost:5000/api/ItemsBlob/DeleteItem/${selectedForDelete.itemID}`,
        {
          method: "DELETE",
        }
      );
      fetchItems(); // Refresh items
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedForDelete(null);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);
  return (
    <div className="container mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Items</h4>
          <Button
            variant="primary"
            onClick={() => {
              setModalData({
                itemID: null,
                itemName: "",
                categoryID: categories[0]?.categoryID || "",
                weight: "",
                price: "",
                description: "",
                imageFile: null,
              });
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            Add Item
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Weight</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.itemID}>
                    <td>{item.itemName}</td>
                    <td>
                      {
                        categories.find(
                          (cat) => cat.categoryID === item.categoryID
                        )?.categoryName
                      }
                    </td>
                    <td>{item.weight}</td>
                    <td>{item.price}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.image && (
                        <img
                          src={`data:image/png;base64,${item.image}`}
                          alt={item.itemName}
                          style={{ width: "50px", height: "50px" }}
                        />
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setModalData({
                                ...item,
                                imageFile: null,
                              });
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
                              setSelectedForDelete(item); 
                              setShowDeleteModal(true); 
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedForDelete?.itemName}"?`}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Item" : "Add Item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={modalData.itemName}
                onChange={(e) =>
                  setModalData({ ...modalData, itemName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={modalData.categoryID}
                onChange={(e) =>
                  setModalData({ ...modalData, categoryID: e.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category.categoryID} value={category.categoryID}>
                    {category.categoryName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="number"
                value={modalData.weight}
                onChange={(e) =>
                  setModalData({ ...modalData, weight: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={modalData.price}
                onChange={(e) =>
                  setModalData({ ...modalData, price: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={modalData.description}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setModalData({ ...modalData, imageFile: e.target.files[0] })
                }
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

export default ItemsList;
