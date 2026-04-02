const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const path = require("path");

async function test() {
    try {
        const uploadsDir = "c:\\Sachin documents\\Text-summaristaion-using-transformers\\uploads";
        const files = fs.readdirSync(uploadsDir);
        const pdfFile = files.find(f => f.toLowerCase().endsWith(".pdf"));
        
        if (pdfFile) {
            const pdfPath = path.join(uploadsDir, pdfFile);
            const buffer = fs.readFileSync(pdfPath);
            console.log("Found PDF:", pdfFile, "size:", buffer.length);
            
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            await parser.destroy();
            
            console.log("Extraction successful!");
            console.log("Text length:", result.text.length);
            console.log("First 100 chars:", result.text.substring(0, 100));
        } else {
            console.log("No PDF found in uploads directory.");
        }
    } catch (e) {
        console.error("TEST_ERROR:", e.stack);
    }
}
test().then(() => process.exit(0));
