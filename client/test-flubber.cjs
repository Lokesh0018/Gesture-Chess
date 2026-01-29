const flubber = require('flubber');

const pawn = "M 50 15 A 12 12 0 1 0 50 39 A 12 12 0 0 0 50 15 Z M 40 40 C 35 60 25 75 20 85 L 80 85 C 75 75 65 60 60 40 C 55 42 45 42 40 40 Z";
const queen = "M 20 85 L 80 85 C 75 60 65 50 60 40 C 70 30 85 15 85 15 C 80 25 75 35 70 40 C 60 20 65 10 65 10 C 60 20 55 30 55 40 C 50 15 50 5 50 5 C 50 15 45 30 45 40 C 40 20 35 10 35 10 C 35 20 40 30 30 40 C 25 35 20 25 15 15 C 15 15 30 30 40 40 C 35 50 25 60 20 85 Z";

try {
  const interpolator = flubber.interpolate(pawn, queen);
  console.log("Success! at 0.5: ", interpolator(0.5));
} catch (e) {
  console.log("Error interpolating:", e.message);
}
