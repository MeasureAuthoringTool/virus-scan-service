/**
 * Because the clamscan package does not support TypeScript or export a default,
 * we have to use the awkward import f = require('f') syntax.
 * This just allows everything using clamscan to use the regular
 * import clamscan from 'clamscan' format
 */
import clamscan = require('clamscan');
export default clamscan;
