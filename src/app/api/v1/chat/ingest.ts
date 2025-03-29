import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import csv from "csv-parser";
import Tesseract from "tesseract.js";
import { embedAndStore } from "./embedding";

export const ingestFile = async (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        case ".pdf":
            await ingestPDF(filePath);
            break;
        case ".json":
            await ingestJSON(filePath);
            break;
        case ".csv":
            await ingestCSV(filePath);
            break;
        case ".png":
        case ".jpg":
        case ".jpeg":
            await ingestImage(filePath);
            break;
        default:
            console.warn("❌ Unsupported file type:", ext);
    }
};

// 📄 PDF
const ingestPDF = async (filePath: string) => {
    const buffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(buffer);
    await embedAndStore(pdfData.text, `pdf-${path.basename(filePath)}`);
};

// 🧾 JSON
const ingestJSON = async (filePath: string) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const items = Array.isArray(data) ? data : [data];

    for (let i = 0; i < items.length; i++) {
        const text = JSON.stringify(items[i]);
        await embedAndStore(text, `json-${i}`);
    }
};

// 📊 CSV
const ingestCSV = async (filePath: string) => {
    const rows: any[] = [];

    await new Promise<void>((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => rows.push(row))
            .on("end", resolve);
    });

    for (let i = 0; i < rows.length; i++) {
        const text = JSON.stringify(rows[i]);
        await embedAndStore(text, `csv-${i}`);
    }
};

// 🖼️ Image (OCR)
const ingestImage = async (imagePath: string) => {
    const result = await Tesseract.recognize(imagePath, "eng");
    const text = result.data.text;
    await embedAndStore(text, `img-${path.basename(imagePath)}`);
};
