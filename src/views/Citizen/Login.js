// --- START OF FILE Login.js (Updated) ---

import {
  Button,
  Card,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {

  // Clear any existing session data when login page loads
  useEffect(() => {
    sessionStorage.removeItem('citizenID');
    sessionStorage.removeItem('username');
    console.log('Both username and citizenID have been removed');
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- This is the updated handleLogin function with the modified validation step ---
  const handleLogin = async () => {
    try {
      // Step 1: Attempt to log in the user
      const loginResponse = await axios.post('http://localhost:5000/login', {
        username,
        password
      });
  
      if (loginResponse.data.success) {
        const user = loginResponse.data.user;
        console.log("Login berjaya:", user);

        // --- MODIFIED VALIDATION STEP ---
        // Step 2: Check for a valid MyKad
        try {
          const mykadCheckResponse = await axios.get(`http://localhost:5000/validMykad?citizenID=${user.id}`);
          
          const validationResult = mykadCheckResponse.data.stat[0]['VALID_MYKAD(:1)'];

          // --- KEY CHANGE IS HERE ---
          if (validationResult === 'N') {
            // If function returns 'N', show the warning but DO NOT stop.
            // We use 'await' to ensure the user sees this message first.
            await Swal.fire({
              icon: 'warning',
              title: 'Perhatian',
              text: 'Anda masih tidak memiliki MyKad. Sila buat permohonan kad pengenalan.',
              confirmButtonText: 'Faham'
            });
            // The "return;" statement has been removed. The code will now continue.
          }

          // Step 3: This part now runs for EVERYONE who logs in successfully,
          // regardless of the MyKad check result.
          await Swal.fire({
            icon: 'success',
            title: 'Berjaya!',
            text: `Selamat datang, ${user.username}!`,
            timer: 2000,
            showConfirmButton: false
          });

          sessionStorage.setItem('citizenID', user.id);
          sessionStorage.setItem('username', user.username);
          navigate('/citizenMenu/Index');

        } catch (validationError) {
          console.error("Ralat semasa memeriksa status MyKad:", validationError);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Mengesahkan Data',
            text: 'Tidak dapat mengesahkan status MyKad anda pada masa ini. Sila cuba lagi.',
          });
        }
        // --- END OF MODIFIED VALIDATION STEP ---

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: loginResponse.data.message || "Nama pengguna atau kata laluan salah.",
        });
      }
    } catch (error) {
      console.error("Ralat:", error);
      const errorMessage = error.response?.data?.message || "Ralat semasa sambungan ke pelayan.";
      Swal.fire({
        icon: 'error',
        title: 'Oops... Sesuatu tidak kena',
        text: errorMessage,
      });
    }
  };
  

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <Form role="form">
            <FormGroup className="mb-3" style={{ marginTop: '20px' }}>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-badge" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Masukkan Username"
                  type="text"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Kata Laluan"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <div className="text-center">
              <Button className="my-4" color="primary" type="button" onClick={handleLogin}>
                Masuk
              </Button>
            </div>
          </Form>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Lupa kata laluan?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Daftar akaun baru</small>
            </a>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;