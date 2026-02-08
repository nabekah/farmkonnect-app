import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/trpc/search.globalSearch';

async function testSearch() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          query: 'animal',
          limit: 10,
          filters: {},
        },
      }),
    });

    const data = await response.json();
    console.log('Search Results for "animal":');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSearch();
