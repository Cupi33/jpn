import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  Container, 
  Row, 
  Col, 
  Button, 
  Input, 
  CardHeader,
  Progress,
  Alert
} from 'reactstrap';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// --- THE FIX IS HERE ---
// Instead of a CDN URL, we point to the local file in our `public` folder.
// This is the most reliable method and avoids all network errors.
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;


const OcrUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [extractedData, setExtractedData] = useState({ name: '', icNumber: '' });
  
  let worker = null;

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setOcrText('');
    setExtractedData({ name: '', icNumber: '' });
    setProgress(0);
  };

  const performOcr = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setOcrText('');

    try {
      worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // --- PDF to Image Conversion (No changes needed here) ---
      const fileReader = new FileReader();
      const imageFromPdf = await new Promise((resolve, reject) => {
        fileReader.onload = async function() {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const page = await pdf.getPage(1);
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          resolve(canvas.toDataURL('image/png'));
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(selectedFile);
      });
      // --- End of PDF Conversion ---

      const { data: { text } } = await worker.recognize(imageFromPdf);
      
      setOcrText(text);
      parseOcrData(text);

    } catch (error) {
      console.error("OCR or PDF Processing Error:", error);
      alert("An error occurred during processing. Please check the console for details.");
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsLoading(false);
    }
  };

  const parseOcrData = (text) => {
    const icRegex = /(\d{6}-\d{2}-\d{4})/;
    const nameRegex = /(?:Nama|Name)\s*\n(.+)/i;
    const icMatch = text.match(icRegex);
    const nameMatch = text.match(nameRegex);
    setExtractedData({
      name: nameMatch ? nameMatch[1].trim() : 'Not found',
      icNumber: icMatch ? icMatch[0].trim() : 'Not found',
    });
  };

  // --- JSX remains the same ---
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg="8">
          <Card>
            <CardHeader>
              <h3>ID Card OCR Scanner (PDF)</h3>
              <p className="text-muted">Upload a PDF of a MyKad to extract the Name and IC Number.</p>
            </CardHeader>
            <CardBody>
              <Input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="mb-3"
              />
              <Button 
                color="primary" 
                onClick={performOcr} 
                disabled={!selectedFile || isLoading}
                block
              >
                {isLoading ? 'Processing...' : 'Scan PDF'}
              </Button>

              {isLoading && (
                <div className="text-center mt-3">
                  <p>Recognizing text... please wait.</p>
                  <Progress animated value={progress} className="my-2" style={{height: '20px'}}>
                    {progress}%
                  </Progress>
                </div>
              )}

              {extractedData.name && !isLoading && (
                <Alert color="success" className="mt-4">
                  <h4>Extracted Information</h4>
                  <hr />
                  <p><strong>Full Name:</strong> {extractedData.name}</p>
                  <p><strong>IC Number:</strong> {extractedData.icNumber}</p>
                </Alert>
              )}

              {ocrText && !isLoading && (
                 <Card className="mt-4">
                    <CardHeader>Raw OCR Output (for debugging)</CardHeader>
                    <CardBody>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {ocrText}
                        </pre>
                    </CardBody>
                 </Card>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OcrUploader;