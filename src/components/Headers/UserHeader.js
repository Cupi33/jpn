// reactstrap components
import { Button, Container, Row, Col } from "reactstrap";

// 1. Accept a "name" prop. We give it a default value of "User"
//    in case nothing is passed to it.
const UserHeader = ({ name = "User" }) => {
  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "600px",
          backgroundImage:
            "url(" + require("../../assets/img/theme/profile-cover.jpg") + ")",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Mask */}
        <span className="mask bg-gradient-default opacity-8" />
        {/* Header container */}
        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="7" md="10">
              {/* 2. Use the "name" prop here instead of the hardcoded "Jesse". */}
              <h1 className="display-2 text-white">Hello {name}</h1>
              <p className="text-white mt-0 mb-5">
                Ini merupakan halaman bagi maklumat peribadi pengguna
              </p>
              <Button
                color="info"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
              >
                Edit profile
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UserHeader;