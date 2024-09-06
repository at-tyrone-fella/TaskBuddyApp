import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fromByteArray } from 'base64-js';

/**
 * Export data to an Excel file and return the file URI.
 * @param {Array} data - The array of data to be exported to Excel.
 * @param {string} fileName - The name of the file to be saved (without extension).
 * @returns {} - The URI of the saved file or null if there was an error.
 */
export const exportToExcel = async (data, fileName) => {

  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data provided for export.');
    return null;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  try {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const base64 = fromByteArray(new Uint8Array(wbout));

    const fileUri = `${FileSystem.cacheDirectory}${fileName}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    return null;
  }
};

/**
 * Share an Excel file using the sharing capabilities of the device.
 * @param {string} fileUri - The URI of the file to be shared.
 * @returns - Resolves when the share action completes or fails.
 */
export const shareFile = async (fileUri) => {
  if (!fileUri) {
    console.error('No file URI provided for sharing.');
    return;
  }

  try {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share or Download Excel File',
      });
    } else {
      console.warn('Sharing not supported on this device.');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
  }
};