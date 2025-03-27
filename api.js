const axios = require('axios');
const qs = require('qs');

const clientId = '70b48a4c6d1d43f5ad000d464a08027d';
const clientSecret = 'e2e7ab1528674c478c56393c70be3009';

const getToken = async () => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';

  const response = await axios.post(tokenUrl,
    qs.stringify({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

  return response.data.access_token;
};

const getProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
    console.log(response.data);
  } catch (err) {
    console.error('Error fetching profile:', err.response?.data || err.message);
  }
};

(async () => {
  const token = await getToken();
  await getProfile(token);
})();

  

