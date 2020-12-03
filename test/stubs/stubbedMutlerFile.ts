import { Readable } from 'stream';

export default {
  fieldname: 'fieldName',
  originalname: 'originalName.txt',
  encoding: 'encoding',
  mimetype: 'mimetype',
  size: 10,
  stream: new Readable(),
  destination: 'destination',
  filename: 'filename.txt',
  path: 'path',
  buffer: Buffer.from('this is a test'),
};
