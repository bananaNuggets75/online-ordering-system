import React from "react";

// Sample menu data (Temporary; will be stored in Firebase later)
const menuData = [
  { id: 1, name: "Burger", description: "Delicious beef burger", price: 5.99 },
  { id: 2, name: "Pizza", description: "Cheese pizza with fresh toppings", price: 8.99 },
  { id: 3, name: "Fries", description: "Crispy golden fries", price: 2.99 },
  { id: 4, name: "Soda", description: "Refreshing soft drink", price: 1.99 },
];

const Menu: React.FC = () => {
  return (
    <div className="menu-container">
      <h2 className="menu-title">Menu</h2>
      <div className="menu-list">
        {menuData.map((item) => (
          <div key={item.id} className="menu-item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p className="menu-price">${item.price.toFixed(2)}</p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
