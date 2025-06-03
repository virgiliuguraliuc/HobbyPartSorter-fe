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

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [modalData, setModalData] = useState({
    itemID: null,
    ItemName: "",
    CategoryID: "",
    Weight: "",
    Price: "",
    Quantity: "",
    Description: "",
    ImageFile: null,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [containers, setContainers] = useState([]);
  const [itemLocations, setItemLocations] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

 

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortField) return 0;
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === "CategoryName") {
      valA =
        categories.find((c) => c.CategoryID === a.CategoryID)?.CategoryName ||
        "";
      valB =
        categories.find((c) => c.CategoryID === b.CategoryID)?.CategoryName ||
        "";
    }
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const toggleAllDetails = () => {
    const allExpanded = Object.values(expandedRows).every((v) => v === true);
    const newState = {};
    items.forEach((item) => {
      newState[item.itemID] = !allExpanded;
    });
    setExpandedRows(newState);
  };

  // Fetch items and categories
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${getApiBaseUrl()}/api/ItemsBlob/GetItems`
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
      const response = await authFetch(
        `${getApiBaseUrl()}/api/ItemsBlob/GetCategories`
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const fetchContainers = async () => {
    const res = await authFetch(
      `${getApiBaseUrl()}/api/containers/GetContainers`
    );
    const data = await res.json();
    setContainers(data);
  };

  const fetchItemLocations = async () => {
    try {
      const res = await authFetch(
        `${getApiBaseUrl()}/api/item_locations/GetItemLocations`
      );
      const data = await res.json();
      setItemLocations(data);
    } catch (err) {
      console.error("Failed to fetch item locations", err);
    }
  };

  // Resize Image before upload
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
          }, file.type || "Image/jpeg");
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
      ? `${getApiBaseUrl()}/api/ItemsBlob/UpdateItem`
      : `${getApiBaseUrl()}/api/ItemsBlob/AddItem`;
    const method = "POST";

    try {
      const formData = new FormData();
      if (isEditing && modalData.itemID !== null) {
        formData.append("itemID", modalData.itemID);
      }
      formData.append("itemName", modalData.ItemName);
      formData.append("categoryID", modalData.CategoryID);
      formData.append("weight", modalData.Weight);
      formData.append("price", modalData.Price);
      formData.append("description", modalData.Description || "");
      formData.append("quantity", modalData.Quantity || "");

      if (modalData.ImageFile) {
        const resizedImage = await handleImageResize(modalData.ImageFile);
        formData.append("image", resizedImage, modalData.ImageFile.name);
      }

      const response = await authFetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        await fetchItems();
        await fetchItemLocations();

        if (modalData.ContainerID) {
          const itemListRes = await authFetch(
            `${getApiBaseUrl()}/api/ItemsBlob/GetItems`
          );
          const itemList = await itemListRes.json();

          const matchedItem = isEditing
            ? itemList.find((i) => i.ItemID === modalData.itemID)
            : itemList.find((i) => i.ItemName === modalData.ItemName);

          if (matchedItem) {
            const existingLink = itemLocations.find(
              (loc) => loc.ItemID === matchedItem.ItemID
            );
            if (existingLink) {
              await authFetch(
                `${getApiBaseUrl()}/api/item_locations/DeleteItemLocation/${
                  existingLink.ItemLocationID
                }`,
                { method: "DELETE" }
              );
            }

            const locationPayload = {
              ItemID: matchedItem.ItemID,
              ContainerID: parseInt(modalData.ContainerID),
              UserID: null,
            };

            await authFetch(
              `${getApiBaseUrl()}/api/item_locations/AddItemLocation`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationPayload),
              }
            );

            await fetchItemLocations();
          }
        }

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
      await authFetch(
        `${getApiBaseUrl()}/api/ItemsBlob/DeleteItem/${
          selectedForDelete.ItemID
        }`,
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
    fetchContainers();
    fetchItemLocations();
  }, []);

  const enrichedItems = items.map((item) => {
    const matchedLocation = itemLocations.find(
      (loc) => loc.ItemID === item.ItemID
    );
    const container = matchedLocation
      ? containers.find((c) => c.ContainerID === matchedLocation.ContainerID)
      : null;

    return {
      ...item,
      ContainerID: matchedLocation?.ContainerID || null,
      ContainerName: container?.ContainerName || null,
      ContainerImage: container?.Image || null,
    };
  });
  const getContainerById = (id) => containers.find((c) => c.ContainerID === id);

  useEffect(() => {
    console.log(containers);
  }, [containers]);

  const sortedEnrichedItems = [...enrichedItems].sort((a, b) => {
    if (!sortField) return 0;
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === "CategoryName") {
      valA =
        categories.find((c) => c.CategoryID === a.CategoryID)?.CategoryName ||
        "";
      valB =
        categories.find((c) => c.CategoryID === b.CategoryID)?.CategoryName ||
        "";
    }
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const toggleDetails = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

   const totalPages = Math.ceil(sortedEnrichedItems.length / itemsPerPage);


  const paginatedItems = sortedEnrichedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Items</h5>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setModalData({
                  itemID: null,
                  ItemName: "",
                  CategoryID: categories[0]?.CategoryID || "",
                  Weight: "",
                  Price: "",
                  Quantity: "",
                  Description: "",
                  ImageFile: null,
                });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              Add Item
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
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>
                      Details
                      <Button
                        size="sm"
                        variant="light"
                        onClick={toggleAllDetails}
                        className="ms-2"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </th>
                    <th>Container</th>
                    <th className="d-none d-md-table-cell">
                      <span className="d-none d-sm-inline">Weight</span> (kg)
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleSort("Weight")}
                        className=""
                      >
                        <i
                          className={`bi ${
                            sortField === "Weight"
                              ? sortOrder === "asc"
                                ? "bi-sort-up"
                                : "bi-sort-down"
                              : "bi-arrow-down-up"
                          }`}
                        />
                      </Button>
                    </th>

                    <th className="d-none d-md-table-cell">
                      <span className="d-none d-sm-inline">Price</span> ($)
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleSort("Price")}
                        className=""
                      >
                        <i
                          className={`bi  ${
                            sortField === "Price"
                              ? sortOrder === "asc"
                                ? "bi-sort-up"
                                : "bi-sort-down"
                              : "bi-arrow-down-up"
                          }`}
                        />
                      </Button>
                    </th>

                    <th>
                      <span className="d-none d-sm-inline"></span> (Cat.)
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleSort("CategoryName")}
                        className=""
                      >
                        <i
                          className={`bi ${
                            sortField === "CategoryName"
                              ? sortOrder === "asc"
                                ? "bi-sort-up"
                                : "bi-sort-down"
                              : "bi-arrow-down-up"
                          }`}
                        />
                      </Button>
                    </th>

                    <th className="d-none d-md-table-cell">
                      <span className="d-none d-sm-inline">Quant.</span> (#)
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleSort("Quantity")}
                        className=""
                      >
                        <i
                          className={`bi ${
                            sortField === "Quantity"
                              ? sortOrder === "asc"
                                ? "bi-sort-up"
                                : "bi-sort-down"
                              : "bi-arrow-down-up"
                          }`}
                        />
                      </Button>
                    </th>

                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const categoryName =
                      categories.find(
                        (cat) => cat.CategoryID === item.CategoryID
                      )?.CategoryName || "Unknown";
                    return (
                      <tr key={item.itemID}>
                        <td>
                          <div className="text-end">
                            {item.Image && (
                              <img
                                src={`data:Image/png;base64,${item.Image}`}
                                alt={item.ItemName}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          {" "}
                          <div className="text-end">{item.ItemName} </div>
                        </td>
                        <td>
                          <div
                            className=" text-end "
                            style={{ whiteSpace: "wrap" }}
                          >
                            <div className="text-end">
                              {expandedRows[item.itemID]
                                ? item.Description
                                : "..."}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-end">
                            {item.ContainerImage ? (
                              <img
                                src={`data:image/png;base64,${item.ContainerImage}`}
                                alt="container"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <small>
                                {getContainerById(item.ContainerID)
                                  ?.ContainerName || "No Container"}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="text-end">{item.Weight} kg </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="text-end">{item.Price} $</div>
                        </td>
                        <td>
                          <div className="text-end">{categoryName}</div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="text-end">{item.Quantity}</div>
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
                                    itemID: item.ItemID,
                                    ItemName: item.ItemName,
                                    CategoryID: item.CategoryID,
                                    Weight: item.Weight,
                                    Price: item.Price,
                                    Description: item.Description,
                                    Quantity: item.Quantity,
                                    ImageFile: null, // image is not preloaded, but upload still works
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
                    );
                  })}
                </tbody>
              </Table>
              
            )}
            <div className="d-flex justify-content-end align-items-center mt-1 gap-1">
  <div>
    <Form.Select
      size="sm"
      style={{ width: "auto" }}
      value={itemsPerPage}
      onChange={(e) => {
        setItemsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1); // Reset to first page when page size changes
      }}
    >
      <option value={5}>5 per page</option>
      <option value={10}>10 per page</option>
      <option value={25}>25 per page</option>
      <option value={50}>50 per page</option>
    </Form.Select>
  </div>

  <div className="d-flex align-items-center">
    <Button
      variant="outline-primary"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="me-2"
    >
      &lt; Prev
    </Button>
    <span>Page {currentPage} of {totalPages}</span>
    <Button
      variant="outline-primary"
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="ms-2"
    >
      Next &gt;
    </Button>
  </div>
</div>
          </Card.Body>
        )}
      </Card>
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedForDelete?.ItemName}"?`}
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
                value={modalData.ItemName}
                onChange={(e) =>
                  setModalData({ ...modalData, ItemName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={modalData.CategoryID}
                onChange={(e) =>
                  setModalData({ ...modalData, CategoryID: e.target.value })
                }
              >
                {categories.map((Category) => (
                  <option key={Category.CategoryID} value={Category.CategoryID}>
                    {Category.CategoryName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="number"
                value={modalData.Weight}
                onChange={(e) =>
                  setModalData({ ...modalData, Weight: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={modalData.Price}
                onChange={(e) =>
                  setModalData({ ...modalData, Price: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={modalData.Description}
                onChange={(e) =>
                  setModalData({ ...modalData, Description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={modalData.Quantity}
                onChange={(e) =>
                  setModalData({ ...modalData, Quantity: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Assign to Container</Form.Label>
              <Form.Control
                as="select"
                value={modalData.ContainerID || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, ContainerID: e.target.value })
                }
              >
                <option value="">-- Select Container --</option>
                {containers.map((c) => (
                  <option key={c.ContainerID} value={c.ContainerID}>
                    {c.ContainerName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setModalData({ ...modalData, ImageFile: e.target.files[0] })
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
