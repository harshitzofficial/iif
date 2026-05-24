const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize cache with standard TTL of 5 minutes (300 seconds)
const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Zoho Inventory API configurations
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

// Base API URL for Zoho Inventory
// Note: Depending on your Data Center, this might be .in, .eu, etc. Defaulting to .com
const ZOHO_INVENTORY_BASE_URL = 'https://www.zohoapis.in/inventory/v1';
const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.in/oauth/v2/token';

let accessToken = null;
let tokenExpiresAt = null;

// Removed redundant MOCK_ITEMS since the application requires live Zoho integration

const isZohoConfigured = () => {
  return ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET && ZOHO_REFRESH_TOKEN && ZOHO_ORGANIZATION_ID && ZOHO_CLIENT_ID !== 'your_client_id_here';
};

const getAccessToken = async () => {
  if (!isZohoConfigured()) return null;

  if (accessToken && tokenExpiresAt && new Date().getTime() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await axios.post(`${ZOHO_ACCOUNTS_URL}`, null, {
      params: {
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });

    if (response.data.access_token) {
      accessToken = response.data.access_token;
      // Token usually expires in 3600 seconds. Buffer of 60 seconds.
      tokenExpiresAt = new Date().getTime() + (response.data.expires_in - 60) * 1000;
      return accessToken;
    }
    throw new Error('Failed to get access token from Zoho');
  } catch (error) {
    console.error('Error refreshing Zoho Access Token:', error.response?.data || error.message);
    throw error;
  }
};

const getItems = async () => {
  if (!isZohoConfigured()) {
    return [];
  }

  // Check cache to reduce latency
  const cacheKey = 'zoho_items';
  const cachedItems = apiCache.get(cacheKey);
  if (cachedItems) {
    return cachedItems;
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`${ZOHO_INVENTORY_BASE_URL}/items`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`
      },
      params: {
        organization_id: ZOHO_ORGANIZATION_ID
      }
    });

    apiCache.set(cacheKey, response.data.items);
    return response.data.items;
  } catch (error) {
    console.error('Error fetching items from Zoho:', error.response?.data || error.message);
    return [];
  }
};

const getItemById = async (itemId) => {
  if (!isZohoConfigured()) {
    return null;
  }

  // Check cache for individual item
  const cacheKey = `zoho_item_${itemId}`;
  const cachedItem = apiCache.get(cacheKey);
  if (cachedItem) {
    return cachedItem;
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`${ZOHO_INVENTORY_BASE_URL}/items/${itemId}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`
      },
      params: {
        organization_id: ZOHO_ORGANIZATION_ID
      }
    });

    apiCache.set(cacheKey, response.data.item);
    return response.data.item;
  } catch (error) {
    console.error(`Error fetching item ${itemId} from Zoho:`, error.response?.data || error.message);
    return null;
  }
};

const getItemImage = async (itemId, documentId = null) => {
  if (!isZohoConfigured()) {
    return null;
  }

  try {
    const token = await getAccessToken();
    let url = `${ZOHO_INVENTORY_BASE_URL}/items/${itemId}/image`;
    if (documentId) {
      url = `${ZOHO_INVENTORY_BASE_URL}/items/${itemId}/images/${documentId}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`
      },
      params: {
        organization_id: ZOHO_ORGANIZATION_ID
      },
      responseType: 'stream'
    });
    return response;
  } catch (error) {
    console.error(`Error fetching item image ${itemId} from Zoho:`, error.message);
    return null;
  }
};

module.exports = {
  getItems,
  getItemById,
  isZohoConfigured,
  getItemImage
};
