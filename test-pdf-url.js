const { PDFParse } = require("pdf-parse");
const path = require("path");

async function testPdfUrl() {
    const url = "https://andonovicmilica.wordpress.com/wp-content/uploads/2018/07/short-stories-for-children.pdf";
    console.log("Downloading PDF from:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("Downloaded buffer size:", buffer.length);

        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();

        console.log("Extracted text length:", data.text.length);
        console.log("First 200 chars:", data.text.substring(0, 200));
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testPdfUrl().then(() => process.exit(0));
