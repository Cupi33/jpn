import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

const Login = () => {
  return (
    <>
      <footer className="py-5">
        <Container>
          <Row className="align-items-center justify-content-center">
            <Col xl="12">
              <div className="copyright text-center text-muted">
                <a
                  className="font-weight-bold ml-1"
                  href="https://www.jpn.gov.my/my/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Laman Web Rasmi JPN
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Login;
