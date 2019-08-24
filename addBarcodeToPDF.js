const fs = require('fs');
const path = require('path');
const barcode = require('barcode');
const HummusRecipe = require('hummus-recipe');
const {
  PDF_DIR_PATH,
  BARCODE_PATH,
  BARCODE_TYPE,
  BARCODE_WIDTH,
  BARCODE_HEIGHT,
  BARCODE_POSITION_X,
  BARCODE_POSITION_Y
} = require('./constants');

const dotIndex = string => string.lastIndexOf('.');
const onlyPdf = file => file.slice(dotIndex(file) + 1).toLowerCase() === 'pdf';
const getFileName = file => file.slice(0, dotIndex(file));

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
    .saveImage(
      BARCODE_PATH,
      error => {
        console.log(error ? error.message : 'Barcode is successfully generated');
        resolve();
      }
    )
);

const addBarcodeToPdf = lastPdf => {
  const pathToFile = `${PDF_DIR_PATH}\\${lastPdf}`;  
  new HummusRecipe(pathToFile, pathToFile)
    .editPage(1)
    .text(
      getFileName(lastPdf),
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
    console.log('Barcode is successfully added to PDF')
}

// START READ FROM THIS POINT ;)
(async () => {
  const files = fs.readdirSync(PDF_DIR_PATH);
  const lastPdf = files.filter(onlyPdf).pop();
  if (!lastPdf) {
    console.log('No Pdf files in folder')
    return;
  } else {
    console.log('PDF is successfully loaded')
  } 
  const lastPdfName = getFileName(lastPdf);
  await generateBarcode(lastPdfName);
  await addBarcodeToPdf(lastPdf);
  fs.unlinkSync(BARCODE_PATH); // delete barcode image
  console.log('Done')
})();
