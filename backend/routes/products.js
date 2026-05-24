const express = require('express');
const router = express.Router();
const zohoService = require('../services/zohoService');

// Removed sampleImages array as we want real data or null
// Utility to extract custom fields easily
const formatProduct = (item) => {
  let securityDeposit = 0;
  let deliveryCharges = 0;

  if (item.custom_fields && Array.isArray(item.custom_fields)) {
    item.custom_fields.forEach(field => {
      if (field.label === 'Security Deposit' || field.api_name === 'Security_Deposit') {
        securityDeposit = parseFloat(field.value) || 0;
      }
      if (field.label === 'Delivery Charges' || field.api_name === 'Delivery_Charges') {
        deliveryCharges = parseFloat(field.value) || 0;
      }
    });
  }

  let imageUrl = null;
  let imageUrls = [];

  if (item.image_name) {
    imageUrl = `http://localhost:5000/api/products/${item.item_id}/image`;
    
    if (item.documents && item.documents.length > 0) {
      imageUrls = item.documents.map(doc => `http://localhost:5000/api/products/${item.item_id}/image?document_id=${doc.document_id}`);
    } else {
      imageUrls = [imageUrl];
    }
  } else {
    // Return null if Zoho has no image
    imageUrl = null;
    imageUrls = [];
  }

  return {
    id: item.item_id,
    name: item.name,
    description: item.description,
    price: item.rate,
    imageUrl,
    imageUrls,
    securityDeposit,
    deliveryCharges,
    rawItemDetails: item
  };
};

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const items = await zohoService.getItems();
    const formattedProducts = items.map(formatProduct);
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id/image
router.get('/:id/image', async (req, res) => {
  try {
    const itemId = req.params.id;
    const documentId = req.query.document_id || null;
    const isConfigured = zohoService.isZohoConfigured();

    if (!isConfigured) {
      return res.status(404).send('Zoho not configured, no image to proxy');
    }

    const imageStream = await zohoService.getItemImage(itemId, documentId);
    if (!imageStream) {
      return res.status(404).send('Image not found in Zoho');
    }

    res.setHeader('Content-Type', imageStream.headers['content-type'] || 'image/jpeg');
    imageStream.data.pipe(res);
  } catch (error) {
    console.error('Failed to proxy Zoho image:', error.message);
    res.status(500).send('Failed to fetch image');
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await zohoService.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const formattedProduct = formatProduct(item);
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

module.exports = router;
