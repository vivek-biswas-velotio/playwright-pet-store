import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Petstore API Test Suite');
  console.log('📊 Test Configuration:');
  console.log(`   - Base URL: ${process.env.BASE_URL || 'https://petstore.swagger.io'}`);
  console.log(`   - API Path: ${process.env.API_BASE_PATH || '/v2'}`);
  console.log(`   - Workers: ${config.workers}`);
  console.log(`   - Projects: ${config.projects.map(p => p.name).join(', ')}`);
  
  // Verify API is accessible
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  try {
    const response = await context.request.get('https://petstore.swagger.io/v2/swagger.json');
    if (response.status() === 200) {
      console.log('✅ Petstore API is accessible');
    } else {
      console.log(`⚠️  Petstore API returned status: ${response.status()}`);
    }
  } catch (error) {
    console.log('❌ Failed to connect to Petstore API:', error);
  }
  
  await context.close();
  await browser.close();
  
  console.log('🎯 Global setup completed\n');
}

export default globalSetup;
