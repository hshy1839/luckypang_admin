import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * JSON 데이터를 엑셀 파일로 저장합니다.
 * @param {Array} data - 엑셀로 변환할 JSON 데이터
 * @param {string} filename - 저장할 파일 이름 (확장자 제외)
 * @param {string} sheetName - 시트 이름 (기본값: 'Sheet1')
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(file, `${filename}.xlsx`);
};
