const express = require('express');
const router = express.Router();
const zohoService = require('../services/zohoService');

const sampleImages = ['/assets/1.png', '/assets/2.png', '/assets/image.png'];

// In-memory cart store for evaluation purposes
// Structure: { itemId: { quantity: 1, product: {...} } }
let cart = {};

// Helper to calculate totals
const calculateTotals = () => {
  let subtotal = 0;
  let totalSecurityDeposit = 0;
  let totalDeliveryCharges = 0;
  
  Object.values(cart).forEach(item => {
    subtotal += item.product.price * item.quantity;
    totalSecurityDeposit += item.product.securityDeposit * item.quantity;
    totalDeliveryCharges += item.product.deliveryCharges * item.quantity;
  });

  const grandTotal = subtotal + totalSecurityDeposit + totalDeliveryCharges;

  return {
    subtotal,
    totalSecurityDeposit,
    totalDeliveryCharges,
    grandTotal
  };
};

// GET /api/cart
router.get('/', (req, res) => {
  const items = Object.values(cart);
  const totals = calculateTotals();
  
  res.json({
    items,
    totals
  });
});

// POST /api/cart
router.post('/', async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    // Fetch product details to ensure we have the latest price and custom fields
    const rawProduct = await zohoService.getItemById(productId);
    if (!rawProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Format product to extract custom fields
    let securityDeposit = 0;
    let deliveryCharges = 0;

    if (rawProduct.custom_fields && Array.isArray(rawProduct.custom_fields)) {
      rawProduct.custom_fields.forEach(field => {
        if (field.label === 'Security Deposit' || field.api_name === 'Security_Deposit') {
          securityDeposit = parseFloat(field.value) || 0;
        }
        if (field.label === 'Delivery Charges' || field.api_name === 'Delivery_Charges') {
          deliveryCharges = parseFloat(field.value) || 0;
        }
      });
    }

    let imageUrl = null;
    if (rawProduct.image_name) {
      if (rawProduct.image_name.startsWith('/assets')) {
        imageUrl = rawProduct.image_name;
      } else {
        imageUrl = `http://localhost:5000/api/products/${rawProduct.item_id}/image`;
      }
    } else {
      imageUrl = sampleImages[(rawProduct.name || '').length % sampleImages.length];
    }

    const product = {
      id: rawProduct.item_id,
      name: rawProduct.name,
      price: rawProduct.rate,
      imageUrl,
      securityDeposit,
      deliveryCharges
    };

    if (cart[productId]) {
      cart[productId].quantity += quantity;
    } else {
      cart[productId] = {
        quantity,
        product
      };
    }

    res.json({ message: 'Item added to cart', cart: Object.values(cart), totals: calculateTotals() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:id (update quantity)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!cart[id]) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  if (quantity <= 0) {
    delete cart[id];
  } else {
    cart[id].quantity = quantity;
  }

  res.json({ message: 'Cart updated', cart: Object.values(cart), totals: calculateTotals() });
});

// DELETE /api/cart/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (cart[id]) {
    delete cart[id];
  }
  
  res.json({ message: 'Item removed from cart', cart: Object.values(cart), totals: calculateTotals() });
});

module.exports = router;
