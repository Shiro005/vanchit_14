// src/utils/excelParser.js
import * as XLSX from "xlsx";

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Read Excel file
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        // Normalize data
        const normalizedData = jsonData.map((row, index) => ({
          // Unique ID (EPIC NO)
          id: row["EPIC NO"]?.toString().trim() || `${index + 1}`,

          // Serial Number
          serialNumber: row["S.NO"] || index + 1,

          // Marathi Full Name
          name: `${row["VOTER NAME"]}`.trim(),

          // EPIC Number
          voterId: row["EPIC NO"]?.toString().trim() || "",

          // Age & Gender
          age: row["AGE"] || "",
          gender: row["GENDER"] || "",

          // Surnames
          marathi_surname: row["VOTER LASTNAME"] || "",
          english_surname:
            row["VOTER LASTNAME_ENG"]
              ?.toString()
              .split(" ")
              .slice(-1)[0] || "",

          // English Name
          voterNameEng: row["VOTER NAME_ENG"] || "",

          // Booth / Polling Center
          boothNumber: row["POLLING_CENTER"] || "",

          // Prabhag (STATIC)
          Prabhag: row["Prabhag Number"] || "",

          // Addresses
          pollingStationAddress:
            row["POLLING_CENTER ADDRESS"] || "",
          yadiBhagAddress:
            row["PART_NAME"] || "",

          whatsapp: row["Mobile Number"] || "",
          ac1: row["AC_NO"] || "",
          ac2: row["AC_PART_NO"] || "",
          ac3: row["AC_PART_SNO"] || "",

          // Timestamp
          lastUpdated: Date.now(),
        }));

        // Auto-download voter.json
        const blob = new Blob(
          [JSON.stringify(normalizedData, null, 2)],
          { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "voter.json";
        a.click();
        URL.revokeObjectURL(url);

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};