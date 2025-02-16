// Menu component (Mobile-first)
import React from 'react';

const Menu = () => {
  const menuData = [
    { id: 1, name: 'Burger', description: 'Delicious beef burger', price: 5.99 },
    { id: 2, name: 'Pizza', description: 'Cheese pizza with fresh toppings', price: 8.99 },
    { id: 3, name: 'Fries', description: 'Crispy golden fries', price: 2.99 },
    { id: 4, name: 'Soda', description: 'Refreshing soft drink', price: 1.99 },
  ];

  return (
    <div className="menu">
      <h2>Menu</h2>
      {menuData.map((item) => (
        <div key={item.id} className="menu-item">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>${item.price.toFixed(2)}</p>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default Menu;
