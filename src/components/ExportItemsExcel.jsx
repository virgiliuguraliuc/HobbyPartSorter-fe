// components/ExportItemsExcel.jsx
import React from "react";
import ExcelJS from "exceljs";

const ExportItemsExcel = ({ items }) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Items");
//headere
    worksheet.columns = [
      { header: "Name", key: "ItemName", width: 25 },
      { header: "Category", key: "CategoryName", width: 15 },
      { header: "Weight", key: "Weight", width: 10 },
      { header: "Price", key: "Price", width: 10 },
      { header: "Quantity", key: "Quantity", width: 10 },
      { header: "Description", key: "Description", width: 30 },
      { header: "Container", key: "ContainerName", width: 20 },
    ];
//ciclam prin obiecte
    for (const [i, item] of items.entries()) {
      const row = worksheet.addRow({
        ItemName: item.ItemName || "",
        CategoryName: item.CategoryName || "",
        Weight: item.Weight || "",
        Price: item.Price || "",
        Quantity: item.Quantity || "",
        Description: item.Description || "",
        ContainerName: item.ContainerName || "",
      });

      row.height = 60;
//adaugam imagine
      if (item.Image) {
        try {
          const imageId = workbook.addImage({
            base64: `data:image/png;base64,${item.Image}`,
            extension: "png",
          });

          worksheet.addImage(imageId, {
            tl: { col: 7, row: i + 1 },
            ext: { width: 50, height: 50 },
          });
        } catch (e) {
          console.warn("Image failed to embed:", item.ItemName);
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "items_with_images.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn btn-success" onClick={handleExport}>
      <i className="bi bi-download me-1" />
      Export to Excel
    </button>
  );
};

export default ExportItemsExcel;
