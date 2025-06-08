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
import Swal from 'sweetalert2'; // <-- 1. Import SweetAlert2

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

  // --- 2. This is the updated handleLogin function ---
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });
  
      if (response.data.success) {
        console.log("Login berjaya:", response.data.user);
        
        // --- REPLACED a success alert() ---
        await Swal.fire({
          icon: 'success',
          title: 'Berjaya!',
          text: `Selamat datang, ${response.data.user.username}!`,
          timer: 2000, // Alert will close automatically after 2 seconds
          showConfirmButton: false
        });

        sessionStorage.setItem('citizenID',response.data.user.id);
        sessionStorage.setItem('username',response.data.user.username);
        navigate('/citizenMenu/Index');

      } else {
        // This 'else' block might not be hit if backend always returns errors with status codes,
        // but we'll keep it for safety.
        console.log("Login gagal:", response.data.message);

        // --- REPLACED a failure alert() ---
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: response.data.message || "Nama pengguna atau kata laluan salah.",
        });
      }
    } catch (error) {
      console.error("Ralat:", error);
      
      // This single block handles all errors (401, 500, network error) gracefully.
      const errorMessage = error.response?.data?.message || "Ralat semasa sambungan ke pelayan.";

      // --- REPLACED ALL error alerts in the catch block ---
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