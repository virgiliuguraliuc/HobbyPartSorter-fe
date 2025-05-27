import React from "react";
import { Card } from "react-bootstrap";
import Categories from "./Categories";
import ItemsList from "./ItemList";

const InventoryOverview = () => {
  return (
    <div className="container mt-2">
      <div className="">
        <Categories />
      </div>

      <div>
        <ItemsList />
      </div>
    </div>
  );
};

export default InventoryOverview;
