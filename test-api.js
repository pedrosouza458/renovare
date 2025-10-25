async function testPostCreation() {
  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://127.0.0.1:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'charqueadas.user@example.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.user.username);
    
    if (!loginData.token) {
      console.error('No token received');
      return;
    }
    
    // Get pins to find one to add a post to
    console.log('\n2. Getting pins...');
    const pinsResponse = await fetch('http://127.0.0.1:3000/pins', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const pinsData = await pinsResponse.json();
    console.log('Pins found:', pinsData.length);
    
    if (pinsData.length === 0) {
      console.error('No pins found');
      return;
    }
    
    const pin = pinsData[0];
    console.log('Using pin:', { id: pin.id.slice(-8), lastActionSummary: pin.lastActionSummary });
    
    // Create a test post
    console.log('\n3. Creating post...');
    const postResponse = await fetch('http://127.0.0.1:3000/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'ALERT',
        text: 'Test post to check lastActionSummary update',
        pinId: pin.id,
        photos: [{ url: 'https://example.com/test.jpg' }]
      })
    });
    
    const postData = await postResponse.json();
    if (postResponse.ok) {
      console.log('Post created successfully:', postData.id);
    } else {
      console.error('Post creation failed:', postData);
      return;
    }
    
    // Check if pin was updated
    console.log('\n4. Checking pin update...');
    const updatedPinResponse = await fetch(`http://127.0.0.1:3000/pins/${pin.id}`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedPin = await updatedPinResponse.json();
    console.log('Updated pin lastActionSummary:', updatedPin.lastActionSummary);
    
    if (updatedPin.lastActionSummary === 'ALERT') {
      console.log('✅ SUCCESS: Pin lastActionSummary was updated correctly!');
    } else {
      console.log('❌ ISSUE: Pin lastActionSummary was not updated correctly');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPostCreation();