import 'dotenv/config';
import { runAllTests } from '@/lib/tests/database-tests';

// Run all database tests
runAllTests()
  .then(() => {
    console.log('\nTests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
  }); 