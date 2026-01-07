#target illustrator

function main() {
    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }

    var originalDoc = app.activeDocument;

    // ===== ENSURE DOCUMENT IS SAVED =====
    if (!originalDoc.saved) {
        var saveFile = File.saveDialog("Please save the Colour logo first", "*.ai");
        if (saveFile == null) {
            alert("Script cancelled. Document must be saved.");
            return;
        } else {
            var saveOpts = new IllustratorSaveOptions();
            saveOpts.compatibility = Compatibility.ILLUSTRATOR17;
            saveOpts.pdfCompatible = true;
            saveOpts.compressed = true;
            originalDoc.saveAs(saveFile, saveOpts);
        }
    }

    // ===== DETERMINE BASE NAME AND FOLDER =====
    var originalFile = new File(originalDoc.fullName.fsName);
    var folder = originalFile.parent; // use folder where file is saved
    var fileName = originalFile.name;

    // Remove extension
    var baseName = fileName.substring(0, fileName.lastIndexOf("."));

    // Remove trailing " Colour" if present
    if (baseName.match(/ Colour$/i)) {
        baseName = baseName.replace(/ Colour$/i, "");
    }

    // ===== COLOR HELPERS =====
    function makeCMYK(c, m, y, k) {
        var col = new CMYKColor();
        col.cyan = c;
        col.magenta = m;
        col.yellow = y;
        col.black = k;
        return col;
    }

    var BLACK = makeCMYK(0, 0, 0, 100);
    var WHITE = makeCMYK(0, 0, 0, 0);

    function recolorDocument(doc, color) {
        var items = doc.pageItems;
        for (var i = 0; i < items.length; i++) {
            try {
                if (items[i].filled) items[i].fillColor = color;
                if (items[i].stroked) items[i].strokeColor = color;
            } catch (e) {}
        }
    }

    function createVersion(suffix, color) {
        var workDoc = app.open(originalFile);
        workDoc.documentColorSpace = DocumentColorSpace.CMYK;

        recolorDocument(workDoc, color);

        var finalFile = new File(folder.fsName + "/" + baseName + "_" + suffix + ".ai");
        var saveOptions = new IllustratorSaveOptions();
        saveOptions.compatibility = Compatibility.ILLUSTRATOR17;
        saveOptions.pdfCompatible = true;
        saveOptions.compressed = true;

        workDoc.saveAs(finalFile, saveOptions);
        workDoc.close(SaveOptions.DONOTSAVECHANGES);
    }

    // ===== CREATE BLACK AND WHITE VERSIONS =====
    createVersion("BLACK", BLACK);
    createVersion("WHITE", WHITE);

    // ===== REACTIVATE ORIGINAL DOCUMENT SAFELY =====
    if (app.documents.length > 0) {
        app.activeDocument = app.documents[0];
    }

    alert("BLACK and WHITE versions saved successfully in:\n" + folder.fsName);
}

main();
