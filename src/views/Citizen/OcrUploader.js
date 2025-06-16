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

const OcrUploader = () => {
  // State to manage the selected file, loading status, OCR progress, and extracted data
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [extractedData, setExtractedData] = useState({ name: '', icNumber: '' });

  // Handle the file selection from the input
  const handleFileChange = (event) => {
    // Reset previous results when a new file is selected
    setSelectedFile(event.target.files[0]);
    setOcrText('');
    setExtractedData({ name: '', icNumber: '' });
    setProgress(0);
  };

  // The main function to perform OCR
  const performOcr = async () => {
    if (!selectedFile) {
      alert('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setOcrText('');

    // Tesseract.js worker to process the image
    const worker = await Tesseract.createWorker({
      logger: m => {
        // Log the progress to update the UI
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    try {
      // Load the English language model
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Recognize the text from the selected file
      const { data: { text } } = await worker.recognize(selectedFile);
      setOcrText(text);

      // Parse the extracted text to find the Name and IC Number
      parseOcrData(text);

    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      // Terminate the worker to free up resources
      await worker.terminate();
      setIsLoading(false);
    }
  };

  // Function to parse the raw OCR text using Regular Expressions (regex)
  const parseOcrData = (text) => {
    // Regex to find a Malaysian IC Number (e.g., 900101-01-5555)
    const icRegex = /(\d{6}-\d{2}-\d{4})/;
    
    // Regex to find the name, which is usually under the "Nama" label
    // This looks for "Nama", followed by a newline, and captures the entire next line.
    const nameRegex = /(?:Nama|Name)\s*\n(.+)/i;

    const icMatch = text.match(icRegex);
    const nameMatch = text.match(nameRegex);

    setExtractedData({
      name: nameMatch ? nameMatch[1].trim() : 'Not found',
      icNumber: icMatch ? icMatch[0].trim() : 'Not found',
    });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg="8">
          <Card>
            <CardHeader>
              <h3>ID Card OCR Scanner</h3>
              <p className="text-muted">Upload an image of a MyKad to extract the Name and IC Number.</p>
            </CardHeader>
            <CardBody>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="mb-3"
              />
              <Button 
                color="primary" 
                onClick={performOcr} 
                disabled={!selectedFile || isLoading}
                block
              >
                {isLoading ? 'Processing...' : 'Scan Image'}
              </Button>

              {/* Progress Bar and Results Section */}
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