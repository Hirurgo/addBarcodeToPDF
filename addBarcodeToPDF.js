const fs = require('fs');
const path = require('path');
const barcode = require('barcode');
const HummusRecipe = require('hummus-recipe');

const pathForPdfFolder = 'C:\\test';

const dotIndex = string => string.lastIndexOf('.');
const getFileName = file => file && file.slice(0, dotIndex(file));
const getFileExtension = file => file && file.slice(dotIndex(file) + 1);
const onlyPdf = file => getFileExtension(file) === 'pdf';
const getLastPdf = files => files.filter(onlyPdf).pop();
const getFiles = path => new Promise(
  resolve => fs.readdir(
    path,
    (err, files) => resolve(files)
 )
);
const generatBarcode = data => new Promise(
  resolve =>
    barcode('code39', { data, width: 400, height: 100 })
    .saveImage(
      pathForPdfFolder + '\\barcode.png',
      (err) => 	resolve(), console.log('File has been written!')
    )
);

// START READ FROM THIS POINT ;)
(async () => {
  const files = await getFiles(pathForPdfFolder);
  const lastPdf = getLastPdf(files);
  const lastPdfName = getFileName(lastPdf);
  const pathToFile = pathForPdfFolder + '\\' + lastPdf;
  await generatBarcode(lastPdfName);
  const pdfObj = new HummusRecipe(pathToFile, pathToFile);
  pdfObj
    .editPage(1)
    .text(lastPdfName, 15, 10, { color: '000000', fontSize: 20 })
    .image('barcode.png',  15, 40, {width: 300, keepAspectRatio: true})
    .endPage()
    .endPDF();
})();

