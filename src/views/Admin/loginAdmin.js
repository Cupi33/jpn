import {
  Button,
  Card,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
} from "reactstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'; // <-- 1. Import SweetAlert2

const Login = () => {
  // Clear any existing session data when login page loads
  useEffect(() => {
    sessionStorage.removeItem('staffID');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role'); // Also clear the role
    console.log('Session data has been cleared');
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/loginStaff', {
        username,
        password
      });

      if (response.data.success) {
        const user = response.data.user;
        console.log("Login berjaya:", user);

        // --- 2. UPDATED: Store user info, including role ---
        sessionStorage.setItem('staffID', user.id);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('role', user.role); // It's good practice to store the role

        // --- 3. UPDATED: Use SweetAlert for a beautiful success message ---
        await Swal.fire({
          icon: 'success',
          title: 'Login Berjaya!',
          text: `Selamat datang, ${user.username}!`,
          timer: 2000, // Automatically close after 2 seconds
          showConfirmButton: false
        });

        // --- 4. UPDATED: Role-based redirection ---
        if (user.role === 'STAFF') {
          navigate('/adminMenu/dashboard');
        } else if (user.role === 'BOARD') {
          navigate('/plain/kependudukan');
        } else {
          // Fallback for any other roles, though you can customize this
          console.warn("Peranan tidak dikenali:", user.role);
          navigate('/adminMenu/dashboard'); 
        }

      } else {
        console.log("Login gagal:", response.data.message);
        // --- 5. UPDATED: Use SweetAlert for error messages ---
        Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
            text: response.data.message || "Nama pengguna atau kata laluan salah."
        });
      }
    } catch (error) {
      console.error("Ralat:", error);
      let errorMessage = "Ralat semasa sambungan ke pelayan."; // Default message

      if (error.response) {
        // Handle specific HTTP status codes from the server
        if (error.response.status === 401) {
          errorMessage = error.response.data.message || "Nama pengguna atau kata laluan salah.";
        } else {
          errorMessage = `Ralat pelayan: ${error.response.data.message || error.response.status}`;
        }
      }
      
      // --- 5. UPDATED: Use SweetAlert for error messages ---
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
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
                  placeholder="Username"
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
      </Col>
    </>
  );
};

export default Login;