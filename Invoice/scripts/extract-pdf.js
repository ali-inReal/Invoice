const fs = require('fs');
const path = require('path');

const pdfPath = process.argv[2] || path.join(
  process.env.USERPROFILE || '',
  'AppData', 'Roaming', 'Cursor', 'User', 'workspaceStorage',
  '4724f3e719f148c7d5be4110adad7b4e', 'pdfs', '4153833d-8cf2-4af6-a708-21bbe54517cc', 'imc 2.pdf'
);

if (!fs.existsSync(pdfPath)) {
  console.error('PDF not found:', pdfPath);
  process.exit(1);
}

const pdfParse = require('pdf-parse');
const dataBuffer = fs.readFileSync(pdfPath);

pdfParse(dataBuffer).then(function(data) {
  console.log('--- TEXT ---');
  console.log(data.text);
  console.log('--- PAGES ---', data.numpages);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
