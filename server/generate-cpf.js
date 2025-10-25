// Simple CPF generator for testing
function generateValidCPF() {
  const cpf = [];
  
  // Generate first 9 digits randomly
  for (let i = 0; i < 9; i++) {
    cpf[i] = Math.floor(Math.random() * 10);
  }
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += cpf[i] * (10 - i);
  }
  let remainder = sum % 11;
  cpf[9] = remainder < 2 ? 0 : 11 - remainder;
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += cpf[i] * (11 - i);
  }
  remainder = sum % 11;
  cpf[10] = remainder < 2 ? 0 : 11 - remainder;
  
  return cpf.join('');
}

// Generate 3 valid CPFs for testing
console.log('Valid CPFs for testing:');
for (let i = 0; i < 3; i++) {
  console.log(generateValidCPF());
}