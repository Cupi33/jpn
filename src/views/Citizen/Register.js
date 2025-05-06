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

const Register = () => {
  const [icno, setIcno] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        icno, username, password
      });

      if (response.data.success) {
        console.log("Pendaftaran Akaun Berjaya untuk:", response.data.user.username);
        alert(`Pendaftaran Akaun Berjaya untuk: ${response.data.user.username}!`);
      } else {
        console.log("Pendaftaran gagal:", response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Server error:", error);
      alert("Ralat pelayan: Tidak dapat mendaftar akaun.");
    }
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <div className="text-center text-muted mb-4">
            <b>Daftar Akaun</b>
          </div>
          <Form role="form">
            {/* Username field */}
            <FormGroup className="mb-3" style={{ marginTop: '20px' }}>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-circle-08" />
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

            {/* IC Number field */}
            <FormGroup className="mb-3" style={{ marginTop: '20px' }}>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-badge" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Nombor Kad Pengenalan"
                  type="text"
                  autoComplete="off"
                  value={icno}
                  onChange={(e) => setIcno(e.target.value)}
                />
              </InputGroup>
            </FormGroup>

            {/* Password field */}
            <FormGroup className="mb-3" style={{ marginTop: '20px' }}>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Kata Laluan"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormGroup>

            <div className="text-muted font-italic">
              <small>
                password strength:{" "}
                <span className="text-success font-weight-700">strong</span>
              </small>
            </div>

            <Row className="my-4">
              <Col xs="12">
                <div className="custom-control custom-control-alternative custom-checkbox">
                  <input
                    className="custom-control-input"
                    id="customCheckRegister"
                    type="checkbox"
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheckRegister"
                  >
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
              <Button
                className="mt-4"
                color="primary"
                type="button"
                onClick={handleRegister}
              >
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
