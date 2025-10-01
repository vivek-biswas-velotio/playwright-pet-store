async function globalTeardown() {
  console.log('\n🏁 Test Suite Completed');
  console.log('📈 Check test results in:');
  console.log('   - HTML Report: playwright-report/index.html');
  console.log('   - JSON Results: test-results.json');
  console.log('   - JUnit XML: test-results.xml');
  console.log('✨ Global teardown completed');
}

export default globalTeardown;
