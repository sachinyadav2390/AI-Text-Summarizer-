try {
    const pdf = require("pdf-parse");
    console.log("PDF_MODULE_TYPE:", typeof pdf);
    console.log("PDF_MODULE_KEYS:", Object.keys(pdf));
    console.log("PDF_MODULE_TOSTRING:", pdf.toString());
    if (pdf.default) {
        console.log("PDF_DEFAULT_TYPE:", typeof pdf.default);
        console.log("PDF_DEFAULT_KEYS:", Object.keys(pdf.default));
    }
} catch (e) {
    console.error("IMPORT_ERROR:", e.stack);
}
process.exit(0);
