import WOW from 'wow.js';

// Initialize WOW.js with custom settings
const wow = new WOW({
  boxClass: 'wow', // Class name that triggers the animation
  animateClass: 'animated', // Class name for animation
  offset: 0, // Distance to the element when triggering the animation
  mobile: true, // Enable animations on mobile devices
  live: true, // Act on asynchronously loaded content
});

// Start WOW.js
wow.init();

export default wow;