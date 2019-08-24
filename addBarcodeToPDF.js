const fs = require('fs');
const path = require('path');
const barcode = require('barcode');
const HummusRecipe = require('hummus-recipe');
const {
  PDF_DIR_PATH,
  BARCODE_DIR_PATH,
  BARCODE_TYPE,
  BARCODE_WIDTH,
  BARCODE_HEIGHT,
  BARCODE_POSITION_X,
  BARCODE_POSITION_Y
} = require('./constants');

const dotIndex = string => string.lastIndexOf('.');
const onlyPdf = file => file.slice(dotIndex(file) + 1) === 'pdf';

const generateBarcode = data => new Promise(
  resolve =>
    barcode(
      BARCODE_TYPE,
      {
        data,
        width: BARCODE_WIDTH,
        height: BARCODE_HEIGHT
      }
    )
    .saveImage(BARCODE_PATH, resolve)
);

const addBarcodeToPdf = lastPdf => {
  const pathToFile = `${PDF_DIR_PATH}\\${lastPdf}`;  
  new HummusRecipe(pathToFile, pathToFile)
    .editPage(1)
    .text(
      lastPdfName,
      BARCODE_POSITION_X,
      BARCODE_POSITION_Y,
      {
        color: '000000',
        fontSize: 20
      })
    .image(
      BARCODE_PATH,
      BARCODE_POSITION_X,
      BARCODE_POSITION_Y + 30,
      {
        width: BARCODE_WIDTH,
        height: BARCODE_HEIGHT
      })
    .endPage()
    .endPDF();
}

// START READ FROM THIS POINT ;)
(async () => {
  const files = fs.readdirSync(PDF_DIR_PATH);
  const lastPdf = files.filter(onlyPdf).pop();
  const lastPdfName = lastPdf.slice(0, dotIndex(file));
  await generateBarcode(lastPdfName);
  await addBarcodeToPdf(lastPdf);
  fs.unlinkSync(BARCODE_PATH); // delete barcode image
})();
