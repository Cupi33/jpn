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
  import { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";

  const Login = () => {
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
        console.log("Login berjaya:", response.data.user);
        alert(`Selamat datang, ${response.data.user.username}!`); // mesej susccess login
        sessionStorage.setItem('staffID',response.data.user.id);
        sessionStorage.setItem('username',response.data.user.username);
        navigate('/adminMenu/dashboard');
      } else {
        console.log("Login gagal:", response.data.message);
        alert(response.data.message || "Nama pengguna atau kata laluan salah.");
      }
    } catch (error) {
      console.error("Ralat:", error);
      if (error.response) {
        // Handle 401 (Unauthorized) specifically
        if (error.response.status === 401) {
          alert(error.response.data.message || "Nama pengguna atau kata laluan salah.");
        } else {
          alert(`Ralat pelayan: ${error.response.data.message || error.response.status}`);
        }
      } else {
        alert("Ralat semasa sambungan ke pelayan.");
      }
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
  