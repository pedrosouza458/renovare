async function testAuth() {
  try {
    // Login
    console.log('Testing login...');
    const loginResponse = await fetch('http://127.0.0.1:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'charqueadas.user@example.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('No token received');
      return;
    }
    
    // Test profile
    console.log('\nTesting profile...');
    const profileResponse = await fetch('http://127.0.0.1:3000/auth/profile', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    console.log('Profile response:', profileData);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();