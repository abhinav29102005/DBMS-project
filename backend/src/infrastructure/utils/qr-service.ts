/**
 * QR Code Service
 * Generates secure, environment-aware QR code URLs for hostel rooms, library books, and student verification.
 */

export type QRResourceType = 'room' | 'book' | 'student' | 'asset';

export interface QRData {
  type: QRResourceType;
  id: string;
  metadata?: Record<string, string>;
}

export class QRService {
  /**
   * The base URL for verification. In production, this points to your uims frontend.
   */
  private static getBaseUrl(): string {
    return 'https://uims.abhinabkumarsingh.tech/verify';
  }

  /**
   * Generates the raw verification URL that the QR code will point to.
   * Format: https://uims.abhinabkumarsingh.tech/verify/[type]/[id]
   */
  static generateVerificationUrl(type: QRResourceType, id: string): string {
    return `${this.getBaseUrl()}/${type}/${id}`;
  }

  /**
   * Generates a high-quality QR Code image URL via QuickChart API.
   * Includes error correction level 'H' (High) for better scan reliability on physical labels.
   * 
   * @param text The data/URL to encode in the QR code
   * @param size Pixel size of the image
   */
  private static getApiImageUrl(text: string, size: number = 300): string {
    const encodedText = encodeURIComponent(text);
    return `https://quickchart.io/qr?text=${encodedText}&size=${size}&margin=2&ecLevel=H`;
  }

  /**
   * Generates a QR image for a Hostel Room.
   * @param qrCodeId The UUID from the hostel.rooms table
   */
  static getRoomQR(qrCodeId: string): string {
    const url = this.generateVerificationUrl('room', qrCodeId);
    return this.getApiImageUrl(url);
  }

  /**
   * Generates a QR image for a Library Book Copy.
   * @param qrCodeId The UUID from the library.book_copies table
   */
  static getBookQR(qrCodeId: string): string {
    const url = this.generateVerificationUrl('book', qrCodeId);
    return this.getApiImageUrl(url);
  }

  /**
   * Generates a QR image for a Student Digital ID.
   * @param studentId The UUID or Roll No
   */
  static getStudentQR(studentId: string): string {
    const url = this.generateVerificationUrl('student', studentId);
    return this.getApiImageUrl(url);
  }
}
