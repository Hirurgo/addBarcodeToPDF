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
const getFileName = file => file.slice(0, dotIndex(file));
const onlyPdf = file => file.slice(dotIndex(file) + 1).toLowerCase() === 'pdf';
const addTimeStamp = file => ({ file, mtime: fs.lstatSync(`${PDF_DIR_PATH}\\${file}`).mtime })
const byTime = (a, b) => a.mtime.getTime() - b.mtime.getTime();
const getLastPdf = files => files
    .filter(onlyPdf)
    .map(addTimeStamp)
    .sort(byTime)
    .pop()
    .file;

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
      getFileName(lastPdf),
    .text(
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
        width: BARCODE_WIDTH / 2,
        height: BARCODE_HEIGHT / 2
      })
    .endPage()
    .endPDF();
}

// START READ FROM THIS POINT ;)
(async () => {
  const files = fs.readdirSync(PDF_DIR_PATH);
  if (files.length === 0) {
    console.log('No Pdf files in folder')
    return;
  }
  const lastPdf = getLastPdf(files)
  const lastPdfName = getFileName(lastPdf);
  if (lastPdfName) {
    console.log('PDF is successfully loaded');
  } else {
    console.log('Can\'t load PDF');
    return;
  }

  await generateBarcode(lastPdfName);
  console.log('Barcode is successfully generated');

  await addBarcodeToPdf(lastPdf);
  console.log('Barcode is successfully added to PDF')

  fs.unlinkSync(BARCODE_PATH); // Delete barcode image
  console.log('Done')

  setTimeout(() => {}, 1500) // Timeout before close node windows
})();
