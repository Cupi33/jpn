import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, Container, Row, Col, Form, FormGroup, Input, Button } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const NewbornApplication = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const [fullname,setFullName] = useState('');
    const [gender,setGender] = useState('');
    const [religion,setReligion] = useState('');
    const [race,setRace] = useState('');
    const [address,setAddress] = useState('');
    const [dob,setDob] = useState('');
    const [fatherFullname,setFatherFullName] = useState('');
    const [fatherICNO,setFatherICNO] = useState('');
    const [motherFullname,setMotherFullName] = useState('');
    const [motherICNO,setMotherICNO] = useState('');
    const [document_detail, setDocument_Detail] = useState('');
    
    // === STATE FOR ADDRESS SUGGESTIONS (NOW STORES FULL OBJECTS) ===
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    
    const [errorFather, setErrorFather] = useState('');
    const [errorMother, setErrorMother] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // === NEW: HANDLER FOR CLICKING A SUGGESTION (from ICApplication.js) ===
    const handleSuggestionClick = (suggestion) => {
        setAddress(suggestion.formatted); // Set the input to the full formatted address
        setAddressSuggestions([]); // Hide the suggestions list
    };

    // === CORRECTED USEEFFECT FOR ADDRESS AUTOCOMPLETE (LOGIC FROM ICAPPLICATION.JS) ===
    useEffect(() => {
        // Don't search if the input is too short
        if (address.trim().length < 3) {
            setAddressSuggestions([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            // ⬇️ **CRITICAL FIX**: Using environment variable for API key
            const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;
            console.log("Attempting to use API Key for NewbornApplication:", apiKey); // Debugging log

            if (!apiKey) {
                console.error("FATAL: OpenCage API Key is not defined. Please check your .env file and restart the development server.");
                return; // Stop if key is missing
            }

            try {
                const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                    params: {
                        q: address,
                        key: apiKey,
                        countrycode: 'my', // Prioritize results for Malaysia
                        limit: 5 // Limit the number of suggestions
                    }
                });
                
                console.log("API Response Received:", response.data); // Debugging log

                if (response.data.results) {
                    // Storing the full result object, not just the string
                    setAddressSuggestions(response.data.results);
                }
            } catch (error) {
                console.error("Error fetching address suggestions:", error);
                setAddressSuggestions([]); // Clear suggestions on error
            }
        }, 500);

        // Cleanup function to clear the timer
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [address]); // This effect runs whenever the `address` state changes
    // ==============================================================================

    const validateParent = async (fullname, icno) => {
        try {
            const response = await axios.post('http://localhost:5000/newbornapply/checkICName', {
            fullname: fullname.toUpperCase(),
            icno
            }, {
            headers: {
                'Content-Type': 'application/json'
            }
            });
            return response.data.success ? response.data.user.citizenID : null;
        } catch (error) {
            console.error('Validation error:', error.response?.data || error.message);
            return false;
        }
    };

    const handleSubmit = async () => {
        const citizenID = sessionStorage.getItem('citizenID');
        setErrorFather('');
        setErrorMother('');
        setSuccessMsg('');

        const trimmedFatherName = fatherFullname.trim();
        const trimmedMotherName = motherFullname.trim();

        const fatherID = await validateParent(trimmedFatherName, fatherICNO);
        const motherID = await validateParent(trimmedMotherName, motherICNO);

        const fatherValid = !!fatherID;
        const motherValid = !!motherID;

        const isFatherICMale = parseInt(fatherICNO.slice(-1)) % 2 === 1;
        const isMotherICFemale = parseInt(motherICNO.slice(-1)) % 2 === 0;

        let hasValidationError = false;

        if (!fatherValid) {
            setErrorFather('Nama penuh dan nombor IC bapa tidak sepadan.');
            hasValidationError = true;
        } else if (!isFatherICMale) {
            setErrorFather('Nombor IC bapa tidak sah — mestilah berakhir dengan nombor ganjil.');
            hasValidationError = true;
        }

        if (!motherValid) {
            setErrorMother('Nama penuh dan nombor IC ibu tidak sepadan.');
            hasValidationError = true;
        } else if (!isMotherICFemale) {
            setErrorMother('Nombor IC ibu tidak sah — mestilah berakhir dengan nombor genap.');
            hasValidationError = true;
        }

        if (!fullname || !gender || !dob || !religion || !race || !address) {
            Swal.fire('Pastikan semua butiran di bahagian Bayi diisi');
            return;
        }

        if (hasValidationError) return;

        setSuccessMsg('Maklumat ibu bapa telah disahkan!');

        const formData = new FormData();
        formData.append('citizenID', citizenID);
        formData.append('fatherID', fatherID);
        formData.append('motherID', motherID);
        formData.append('babyName', fullname.trim());
        formData.append('gender', gender);
        formData.append('dob', dob);
        formData.append('religion', religion);
        formData.append('race', race);
        formData.append('address', address.trim());
        if (document_detail) {
            formData.append('document', document_detail);
        }

        try {
            const response = await axios.post('http://localhost:5000/newbornapply/1', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
            });

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
            Swal.fire('Ralat server! Sila cuba lagi.');
        }
    };

    useEffect(() => {
        const storedCitizenID = sessionStorage.getItem('citizenID');
        const storedUsername = sessionStorage.getItem('username');

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
                        <div className="text-right">
                            <Button
                                color="info"
                                outline
                                size="sm"
                                onClick={() => window.open('https://www.jpn.gov.my/my/perkhidmatan/kelahiran', '_blank', 'noopener,noreferrer')}
                            >
                                Lihat Syarat Permohonan
                            </Button>
                        </div>
                        <CardTitle tag="h3" className="mb-4 text-center">
                        Pendaftaran Bayi (Bahagian Bayi)
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
                                            htmlFor="input-fullname"
                                        >
                                            Nama Penuh Bayi
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-fullname"
                                            placeholder="Contoh: Muhammad Sufi Haikal Bin Saifuzbahari"
                                            type="text"
                                            value={fullname}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                </FormGroup>
                                </Col>
                                </Row>

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-gender"
                                        >
                                            Jantina
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-gender"
                                            type="select" 
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            >

                                            <option value="">Pilih Jantina</option>
                                            <option value="LELAKI">Lelaki</option>
                                            <option value="PEREMPUAN">Perempuan</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-religion"
                                        >
                                            Agama
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-religion"
                                            type="select"
                                            value={religion}
                                            onChange={(e) => setReligion(e.target.value)}
                                             >

                                            <option value="">Pilih Agama</option>
                                            <option value="ISLAM">Islam</option>
                                            <option value="BUDDHA">Buddha</option>
                                            <option value="HINDU">Hindu</option>
                                            <option value="KRISTIAN">Kristian</option>
                                            <option value="LAIN-LAIN">Lain-lain</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-race"
                                        >
                                            Bangsa
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-race"
                                            type="select"
                                            value={race}
                                            onChange={(e) => setRace(e.target.value)}
                                            >
                                            <option value="">Pilih Bangsa</option>
                                            <option value="MELAYU">Melayu</option>
                                            <option value="CINA">Cina</option>
                                            <option value="INDIA">India</option>
                                            <option value="LAIN-LAIN">Lain-lain</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>

                                {/* === MODIFIED AND CORRECTED ADDRESS INPUT SECTION === */}
                                <Row>
                                    <Col lg="12">
                                        <FormGroup style={{ position: 'relative' }}>
                                            <label
                                                className="form-control-label"
                                                htmlFor="input-address"
                                            >
                                                Alamat
                                            </label>
                                            <Input
                                                className="form-control"
                                                id="input-address"
                                                placeholder="Mula menaip alamat untuk carian automatik..."
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                autoComplete="off"
                                            />
                                            {/* Render suggestions dropdown (UI from ICApplication.js) */}
                                            {addressSuggestions.length > 0 && (
                                                <div className="list-group" style={{ position: 'absolute', width: '100%', zIndex: 1000 }}>
                                                    {addressSuggestions.map((suggestion, index) => (
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
                                {/* ==================================================== */}


                                <Row>
                                    <Col lg="12">
                                        <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-dob"
                                        >
                                            Tarikh Lahir
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-dob"
                                            type="date"
                                            max={new Date().toISOString().split("T")[0]}
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                        />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                    <FormGroup>
                                    <label
                                        className="form-control-label"
                                        htmlFor="upload-hospital-report"
                                    > 
                                        Sijil Lahir Daripada Hospital
                                    </label>
                                    <Input
                                        className="form-control"
                                        id="upload-hospital-report"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setDocument_Detail(e.target.files[0])}
                                    />
                                    </FormGroup>

                            </div>
                            </Form>
                        </Col>
                        </Row>
                    </CardBody>
               </Card>
                </Col>
            </Row>

            <div className="my-5"></div>

            <Row className='justify-content-center'> 
                <Col md="8">
                <Card className="shadow">
                    <CardBody>
                        <CardTitle tag="h3" className="mb-4 text-center">
                        Pendaftaran Bayi (Bahagian Ibu Bapa)
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
                                            htmlFor="input-fatherFullname"
                                        >
                                            Nama Penuh Bapa (Seperti Di Kad Pengenalan)
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-fatherFullname"
                                            placeholder="Contoh: Saifuzbahari Bin Ishak"
                                            type="text"
                                            value={fatherFullname}
                                            onChange={(e) => setFatherFullName(e.target.value)}
                                        />
                                        <small className="text-danger">{errorFather}</small>
                                </FormGroup>
                                </Col>
                                </Row>

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-icnoFather"
                                        >
                                            Nombor Kad Pengenalan Bapa
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-icnoFather"
                                            placeholder="Contoh: 800101065001"
                                            type="text"
                                            maxLength="12"
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                            }}
                                            value={fatherICNO}
                                            onChange={(e) => setFatherICNO(e.target.value)}
                                        />
                                </FormGroup>
                                </Col>
                                </Row>

                                {/* Mother */}
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-motherFullname"
                                        >
                                            Nama Penuh Ibu (Seperti Di Kad Pengenalan)
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-motherFullname"
                                            placeholder="Contoh: Nurul Fatihah Binti Ahmad"
                                            type="text"
                                            value={motherFullname}
                                            onChange={(e) => setMotherFullName(e.target.value)}
                                        />
                                        <small className="text-danger">{errorMother}</small>
                                </FormGroup>
                                </Col>
                                </Row>  

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-icnoMother"
                                        >
                                            Nombor Kad Pengenalan Ibu
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-icnoMother"
                                            placeholder="Contoh: 820202065002"
                                            type="text"
                                            maxLength="12"
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                            }}
                                            value={motherICNO}
                                            onChange={(e) => setMotherICNO(e.target.value)}
                                        />
                                </FormGroup>
                                </Col>
                                </Row> 
                            </div>

                            <hr className="my-4" />
                            <div className="text-center">
                                <Button color="primary" type="button" onClick={handleSubmit}>
                                  Hantar Permohonan
                                </Button>
                                {successMsg && <p className="text-success mt-2">{successMsg}</p>}
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

export default NewbornApplication;