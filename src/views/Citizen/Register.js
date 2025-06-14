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
import { useState } from "react";
import axios from "axios";
// --- NEW: Import SweetAlert2 for better user feedback ---
import Swal from 'sweetalert2';

const Register = () => {
  const [icno, setIcno] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // --- NEW: State for the confirm password field ---
  const [confirmPassword, setConfirmPassword] = useState('');
  // --- NEW: State for the terms and conditions checkbox ---
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    // --- NEW: Comprehensive validation logic ---
    if (!termsAccepted) {
      return Swal.fire("Perhatian", "Anda mesti bersetuju dengan terma dan syarat untuk mendaftar.", "warning");
    }

    if (!icno || !username || !password || !confirmPassword) {
      return Swal.fire("Ralat", "Sila lengkapkan semua medan pendaftaran.", "error");
    }

    if (username.length < 6) {
      return Swal.fire("Nama Pengguna Lemah", "Nama pengguna mestilah sekurang-kurangnya 6 aksara.", "warning");
    }

    if (password.length < 6) {
      return Swal.fire("Kata Laluan Lemah", "Kata laluan mestilah sekurang-kurangnya 6 aksara.", "warning");
    }

    const hasDigit = /\d/;
    if (!hasDigit.test(password)) {
      return Swal.fire("Kata Laluan Lemah", "Kata laluan mestilah mengandungi sekurang-kurangnya satu digit (0-9).", "warning");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Ralat", "Kata laluan dan konfirmasi kata laluan tidak sepadan.", "error");
    }
    // --- End of validation ---


    try {
      // The backend only needs the final password, not the confirmation one.
      const response = await axios.post('http://localhost:5000/register', {
        icno, username, password
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berjaya!',
          text: `Akaun untuk ${response.data.user.username} telah berjaya didaftarkan.`,
        });
        // Optional: Clear form fields after successful registration
        setIcno('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setTermsAccepted(false);
      } else {
        // This 'else' block might not be reached if backend uses HTTP error codes, but it's good practice to keep it.
        Swal.fire("Pendaftaran Gagal", response.data.message, "error");
      }
    } catch (error) {
      console.error("Server error:", error);
      // Show the specific error message from the backend (e.g., "Username sudah wujud")
      const errorMessage = error.response?.data?.message || "Ralat pelayan: Tidak dapat mendaftar akaun.";
      Swal.fire("Oops... Sesuatu tidak kena", errorMessage, "error");
    }
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0 p-4"> {/* Added padding for better spacing */}
          <div className="text-center text-muted mb-4">
            <b>Daftar Akaun</b>
          </div>
          <Form role="form">

            {/* IC Number field */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-badge" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nombor Kad Pengenalan" type="text" autoComplete="off" value={icno} onChange={(e) => setIcno(e.target.value)} />
              </InputGroup>
            </FormGroup>

            {/* Username field */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-circle-08" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Username (sekurangnya 6 aksara)" type="text" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} />
              </InputGroup>
            </FormGroup>

            {/* Password field */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Kata Laluan (6+ aksara, 1+ digit)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </InputGroup>
            </FormGroup>

            {/* --- NEW: Confirm Password field --- */}
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Konfirmasi Kata Laluan" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </InputGroup>
            </FormGroup>

            {/* The password strength indicator is currently static. You could make this dynamic in the future. */}
            <div className="text-muted font-italic mt-2">
              <small>
                Kekuatan kata laluan:{" "}
                <span className="text-success font-weight-700">kuat</span>
              </small>
            </div>

            <Row className="my-4">
              <Col xs="12">
                <div className="custom-control custom-control-alternative custom-checkbox">
                  {/* --- MODIFIED: Connected to state --- */}
                  <input
                    className="custom-control-input"
                    id="customCheckRegister"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label className="custom-control-label" htmlFor="customCheckRegister">
                    <span className="text-muted">
                      Saya bersetuju dengan{" "}
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>
                        terma & syarat
                      </a>
                    </span>
                  </label>
                </div>
              </Col>
            </Row>

            {/* Register Button */}
            <div className="text-center">
              <Button className="mt-4" color="primary" type="button" onClick={handleRegister}>
                Daftar Akaun
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </>
  );
};

export default Register;