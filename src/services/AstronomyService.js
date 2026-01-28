import { ASTRONOMY_API } from '../config/constants';

const { APPLICATION_ID, APPLICATION_SECRET, ASTRONOMY_API_URL } = ASTRONOMY_API;

const hash = btoa(`${APPLICATION_ID}:${APPLICATION_SECRET}`);

export async function fetchMoonTextureUrl(lat, lng) {
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(ASTRONOMY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${hash}`
      },
      body: JSON.stringify({
        format: 'png',
        style: {
          moonStyle: 'default',
          backgroundStyle: 'solid',
          backgroundColor: 'transparent'
        },
        observer: {
          latitude: lat,
          longitude: lng,
          date: today
        },
        view: {
          type: 'portrait-simple'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Astronomy API failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched moon image URL:", data.data.imageUrl);
    return data.data.imageUrl;

  } catch (error) {
    console.error("Failed to fetch moon texture from Astronomy API:", error);
    return null;
  }
}
