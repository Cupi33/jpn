import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardBody, CardTitle, Container, Row, Col, Form, FormGroup, Input, Button, Label
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';


const ICApplication = () => {
    const [selectedReason, setSelectedReason] = useState('');
    const navigate = useNavigate();
    const [reportFile, setReportFile] = useState(null);
    const handleReasonChange = (e) => {
        setSelectedReason(e.target.value);
    };
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]); // ✨ NEW: State to hold address suggestions

    // ✨ NEW: Handler for when a user clicks a suggestion
    const handleSuggestionClick = (suggestion) => {
        setAddress(suggestion.formatted); // Set the input to the full formatted address
        setSuggestions([]); // Hide the suggestions list
    };

    // ✨ NEW: useEffect to fetch address suggestions from OpenCage
    useEffect(() => {
        if (!address || address.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            // --- DEBUGGING BLOCK START ---
            const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;
            console.log("Attempting to use API Key:", apiKey); // 👈 **CHECK THIS LOG**

            if (!apiKey) {
                console.error("FATAL: OpenCage API Key is not defined. Please check your .env file and restart the development server.");
                return; // Stop if key is missing
            }
            // --- DEBUGGING BLOCK END ---

            try {
                const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                    params: {
                        q: address,
                        key: apiKey,
                        countrycode: 'my',
                        limit: 5
                    }
                });
                
                console.log("API Response Received:", response.data); // 👈 **CHECK THIS LOG**

                if (response.data.results) {
                    setSuggestions(response.data.results);
                }
            } catch (error) {
                console.error("Error fetching address suggestions:", error);
                setSuggestions([]);
            }
        }, 500);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [address]);


    const handleSubmit = async () => {
        const citizenID = sessionStorage.getItem('citizenID');

        if (!selectedReason) {
            Swal.fire('Sila pilih sebab permohonan.');
            return;
        }

        try {
            let response;

            if (selectedReason === 'ta') {
                if (!address.trim()) {
                    Swal.fire('Sila masukkan alamat baru.');
                    return;
                }

                // POST to /2 with JSON
                response = await axios.post('http://localhost:5000/icapply/2', {
                    citizenID,
                    address
                });

            } else if (selectedReason === 'ha') {
                if (!reportFile) {
                    Swal.fire('Sila muat naik surat laporan PDRM.');
                    return;
                }

                const formData = new FormData();
                formData.append('citizenID', citizenID);
                formData.append('reasons', selectedReason);
                formData.append('document', reportFile);

                response = await axios.post('http://localhost:5000/icapply/1', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

            } else {
                response = await axios.post('http://localhost:5000/icapply/1', {
                    citizenID,
                    reasons: selectedReason
                });
            }

            const { data } = response;

            Swal.fire({
                icon: data.success ? 'success' : 'error',
                title: data.message,
                confirmButtonText: 'Pergi ke halaman utama',
            }).then(() => {
                if (data.success) {
                    navigate('/citizenMenu/index');
                }
            });

        } catch (err) {
            console.error('Submission error:', err);

            if (err.response && err.response.data && err.response.data.message) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Permohonan Ditolak',
                    text: err.response.data.message,
                });
            } else {
                Swal.fire('Ralat server! Sila cuba lagi.');
            }
        }
    };


    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Checking session storage...');
        const storedCitizenID = sessionStorage.getItem('citizenID');
        const storedUsername = sessionStorage.getItem('username');

        console.log('Current citizenID:', storedCitizenID);
        console.log('Current username:', storedUsername);

        if (storedCitizenID && storedUsername) {
            setIsLoading(false);
        } else {
            navigate('/authCitizen/login');
        }
    }, [navigate]);

    if (isLoading) {
        return (
            <Container className="mt-5 text-center">
                <h4>Loading...</h4>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md="8">
                    <Card className="shadow">
                        <CardBody>
                            {/* === ADDED BUTTON HERE === */}
                            <div className="text-right">
                                <Button
                                    color="info"
                                    outline
                                    size="sm"
                                    onClick={() => window.open('https://www.jpn.gov.my/my/perkhidmatan/kad-pengenalan', '_blank', 'noopener,noreferrer')}
                                >
                                    Lihat Syarat Permohonan
                                </Button>
                            </div>
                            {/* ======================= */}
                            <CardTitle tag="h3" className="mb-4 text-center">
                                Permohonan Kad Pengenalan
                            </CardTitle>
                            <Row className="justify-content-center">
                                <Col lg="8">
                                    <Form>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="12">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-reasons"
                                                        >
                                                            Sebab Permohonan Kad Pengenalan
                                                        </label>
                                                        <Input
                                                            className="form-control"
                                                            id="input-reasons"
                                                            type="select"
                                                            value={selectedReason}
                                                            onChange={handleReasonChange}
                                                        >
                                                            <option value="">Pilih Sebab</option>
                                                            <option value="ha">Hilang Kad</option>
                                                            <option value="ta">Tukar Alamat</option>
                                                            <option value="mykid">Tukar MyKid ke MyKad</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {selectedReason === 'ta' && (
                                                <Row>
                                                    <Col lg="12">
                                                        {/* ✨ MODIFIED: Added position-relative to the FormGroup for suggestion list positioning */}
                                                        <FormGroup style={{ position: 'relative' }}>
                                                            <label
                                                                className="form-control-label"
                                                                htmlFor="input-new-address"
                                                            >
                                                                Alamat Baru
                                                            </label>
                                                            <Input
                                                                className="form-control"
                                                                id="input-new-address"
                                                                placeholder="Mula taip alamat baru..."
                                                                type="text"
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                                autoComplete="off" // ✨ NEW: Disable browser autocomplete
                                                            />

                                                            {/* ✨ NEW: Render the suggestions list */}
                                                            {suggestions.length > 0 && (
                                                                <div className="list-group" style={{ position: 'absolute', width: '100%', zIndex: 1000 }}>
                                                                    {suggestions.map((suggestion, index) => (
                                                                        <button
                                                                            type="button"
                                                                            key={index}
                                                                            className="list-group-item list-group-item-action"
                                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                                        >
                                                                            {suggestion.formatted}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {selectedReason === 'ha' && (
                                                <Row>
                                                    <Col lg="12">
                                                        <FormGroup>
                                                            <Label
                                                                className="form-control-label"
                                                                htmlFor="upload-report"
                                                            >
                                                                Surat Laporan PDRM
                                                            </Label>
                                                            <Input
                                                                className="form-control"
                                                                id="upload-report"
                                                                type="file"
                                                                accept=".pdf"
                                                                onChange={(e) => setReportFile(e.target.files[0])}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}
                                        </div>

                                        <hr className="my-4" />

                                        <div className="text-center">
                                            <Button
                                                className="my-4"
                                                color="primary"
                                                type="button"
                                                onClick={handleSubmit}
                                            >
                                                Hantar Permohonan
                                            </Button>
                                        </div>
                                    </Form>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ICApplication;