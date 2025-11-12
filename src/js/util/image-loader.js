/**
 * Creates Image objects using files found in the specified directory with the specified common name.
 * @param {string} directory - Path to the folder that contains the images
 * @param {*} commonName - Common name that each image shares (bird_idle, bird_fly)
 * @param {*} numExpected - Number of expected images in the target directory
 * @returns An array of the new images created
 */
export function loadImageGroup(directory, commonName, numExpected) {
  const res = [];
  for (let i = 0; i < numExpected; i++) {
    const img = new Image();
    img.src = directory + commonName + '_' + i + '.png';
    res.push(img);
  }
  return res;
}