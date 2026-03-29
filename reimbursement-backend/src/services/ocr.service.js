/**
 * OCR Service Placeholder
 *
 * Hook for future OCR integration (e.g., Google Vision, Tesseract, AWS Textract).
 * When implemented, this will extract data from receipt images.
 */
class OCRService {
  /**
   * Extract text/data from a receipt image
   * @param {string} imageUrl - URL or path to the receipt image
   * @returns {Promise<object>} Extracted receipt data
   */
  async extractReceiptData(imageUrl) {
    // TODO: Integrate with OCR provider
    // Example providers:
    //   - Google Cloud Vision API
    //   - AWS Textract
    //   - Tesseract.js (local, no API key needed)
    //   - Azure Computer Vision

    console.log(`[OCR Placeholder] Would extract data from: ${imageUrl}`);

    return {
      extracted: false,
      message: 'OCR service not yet implemented',
      data: {
        amount: null,
        vendor: null,
        date: null,
        category: null,
        rawText: null,
      },
    };
  }

  /**
   * Validate receipt authenticity (future)
   */
  async validateReceipt(imageUrl) {
    return { valid: true, confidence: 0, message: 'Validation not implemented' };
  }
}

module.exports = new OCRService();
