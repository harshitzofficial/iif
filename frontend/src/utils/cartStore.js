export const getCart = () => {
  const cart = localStorage.getItem('iif_cart');
  return cart ? JSON.parse(cart) : {};
};

export const saveCart = (cart) => {
  localStorage.setItem('iif_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  if (cart[product.id]) {
    cart[product.id].quantity += quantity;
  } else {
    cart[product.id] = { quantity, product };
  }
  saveCart(cart);
};

export const updateQuantity = (productId, quantity) => {
  const cart = getCart();
  if (!cart[productId]) return;
  
  if (quantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId].quantity = quantity;
  }
  saveCart(cart);
};

export const removeFromCart = (productId) => {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
};

export const getCartTotals = () => {
  const cart = getCart();
  let subtotal = 0;
  let totalSecurityDeposit = 0;
  let totalDeliveryCharges = 0;
  
  Object.values(cart).forEach(item => {
    subtotal += item.product.price * item.quantity;
    totalSecurityDeposit += (item.product.securityDeposit || 0) * item.quantity;
    totalDeliveryCharges += (item.product.deliveryCharges || 0) * item.quantity;
  });

  return {
    subtotal,
    totalSecurityDeposit,
    totalDeliveryCharges,
    grandTotal: subtotal + totalSecurityDeposit + totalDeliveryCharges
  };
};

export const getCartItems = () => {
  return Object.values(getCart());
};
