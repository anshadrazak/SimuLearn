import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/update-videos/update-videos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', data);
    try {
      const json = JSON.parse(data);
      console.log('\n--- Update Results ---');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
