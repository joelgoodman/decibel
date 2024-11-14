import toobusy from 'toobusy-js';

// Configure toobusy
toobusy.maxLag(70); // Max lag in milliseconds before rejecting requests
toobusy.interval(500); // Check interval in milliseconds

process.on('SIGINT', () => {
  toobusy.shutdown();
  process.exit();
});

export { toobusy };