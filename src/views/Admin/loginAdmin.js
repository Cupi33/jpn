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
  
  const Login = () => {
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
                      placeholder="Nombor Kad Pengenalan"
                      type="icno"
                      autoComplete="off"
                      pattern="[0-9]*"
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
                    />
                  </InputGroup>
                </FormGroup>
                <div className="text-center">
                  <Button className="my-4" color="primary" type="button">
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
  