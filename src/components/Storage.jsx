import React from "react";
import { Card } from "react-bootstrap";
import Locations from "./Locations";
import Containers from "./Containers";


const Storage = () => {


    return (
 <div className="container mt-2">
      <div className="">
        <Locations />
      </div>

      <div>
        <Containers />
      </div>
    </div>
    );
};

export default Storage;