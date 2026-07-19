import '@testing-library/jest-dom/vitest'

// jsdom's Blob/File don't implement arrayBuffer(); delegate to FileReader so
// code that buffers uploads (e.g. useUploadCsv) runs its real path in tests.
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}
