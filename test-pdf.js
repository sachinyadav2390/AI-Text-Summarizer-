try {
    const pdf = require("pdf-parse");
    console.log("PDF_MODULE_TYPE:", typeof pdf);
    console.log("PDF_MODULE_KEYS:", Object.keys(pdf));
    if (pdf.default) {
        console.log("PDF_DEFAULT_TYPE:", typeof pdf.default);
    }
} catch (e) {
    console.error("IMPORT_ERROR:", e.message);
}
process.exit(0);
