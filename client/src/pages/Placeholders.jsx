import React from 'react';

const Placeholder = ({ title }) => (
  <div>
    <h2>{title}</h2>
    <p style={{ marginTop: '16px' }}>Coming soon...</p>
  </div>
);

export const Customers = () => <Placeholder title="Customers" />;
export const Products = () => <Placeholder title="Products" />;
export const Inventory = () => <Placeholder title="Inventory" />;
export const Challans = () => <Placeholder title="Challans" />;
