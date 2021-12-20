const defaultBoundary = 'XXX';

/**
 * This is builder can generate realistic looking POST data for testing.
 */
export class PostDataBuilder {
  private readonly boundary: string;
  private postData = '';
  constructor(boundary: string = defaultBoundary) {
    this.boundary = `--${boundary}`;
    this.reset();
  }

  reset(): void {
    this.postData = '';
  }

  addField(fieldName: string, fieldValue: string): PostDataBuilder {
    const fieldInfo = `${this.boundary}\r\nContent-Disposition: form-data; name="${fieldName}"\r\n\r\n${fieldValue}\r\n`;
    this.postData = `${this.postData}${fieldInfo}`;
    return this;
  }

  addFile(
    fieldName: string,
    fileName: string,
    fileContents: string,
    contentType = 'text/plain',
  ): PostDataBuilder {
    const fileInfo = `${this.boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n${fileContents}\r\n`;
    this.postData = `${this.postData}${fileInfo}`;
    return this;
  }

  build(): string {
    return `${this.postData}${this.boundary}--`;
  }
}
