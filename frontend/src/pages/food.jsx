import React, { useState } from "react";

const OrderForm = ({ onOrderSubmit }) => {
  const [order, setOrder] = useState([]);

  const handleAddItem = (item, quantity) => {
    setOrder([...order, { item, quantity }]);
  };

  const handleSubmit = () => {
    onOrderSubmit(order);
  };

  return (
    <div>
      <h2>Place Your Order</h2>
      <div>
        <button onClick={() => handleAddItem("Pizza", 1)}>Add Pizza</button>
        <button onClick={() => handleAddItem("Burger", 1)}>Add Burger</button>
        <button onClick={() => handleAddItem("Soda", 1)}>Add Soda</button>
      </div>
      <button onClick={handleSubmit}>Submit Order</button>
    </div>
  );
};

export default OrderForm;
