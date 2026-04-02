try {
    const pdfModule = require("pdf-parse");
    console.log("PDFParse type:", typeof pdfModule.PDFParse);
    if (typeof pdfModule.PDFParse === "function") {
        console.log("PDFParse is a function/class");
    }
} catch (e) {
    console.error("DEBUG_ERROR:", e.message);
}
process.exit(0);
