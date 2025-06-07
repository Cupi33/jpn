import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "components/Headers/UserHeader.js";

const Profile = () => {
  const [citizenID, setCitizenID] = useState("");
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(
    require("../../assets/img/theme/team-4-800x800.jpg")
  );
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCitizenID = sessionStorage.getItem("citizenID");
    const storedUsername = sessionStorage.getItem("username");

    if (storedCitizenID && storedUsername) {
      setCitizenID(storedCitizenID);
      setUsername(storedUsername);

      // This URL is correct: /profile/profile
      axios.post("http://localhost:5000/profile/profile", { citizenID: storedCitizenID })
        .then((response) => {
          if (response.data.success) setProfileData(response.data.user);
          else console.error("Failed to fetch profile data:", response.data.message);
        })
        .catch((error) => console.error("Error fetching profile data:", error));
      
      // 👇 3. Fetch the profile picture using the NEW URL
      axios.get(`http://localhost:5000/profile/get-picture/${storedCitizenID}`, { responseType: 'blob' })
        .then(response => {
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePicUrl(imageUrl);
        })
        .catch(error => {
            console.log("No profile picture found or failed to load. Using default.");
        });

    } else {
      navigate("/authCitizen/login");
    }
  }, [navigate]);

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProfilePicUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('citizenID', citizenID);

    try {
      // 👇 4. Use the NEW URL for uploading the picture
      const response = await axios.put(
        'http://localhost:5000/profile/upload-picture',
        formData
      );
      if (response.data.success) {
        alert('Profile picture updated successfully!');
      } else {
        alert('Failed to update picture: ' + response.data.message);
      }
    } catch (error) {
      // This catch block will now only be triggered for genuine server errors
      console.error("Error uploading image:", error);
      alert('An error occurred while uploading the picture.');
    }
  };

  const handleUbahProfilClick = () => {
    fileInputRef.current.click();
  };

  // The rest of your JSX remains exactly the same...
  return (
    <>
      <UserHeader name={profileData?.fullname || username} />
      
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image">
                    <input
                      type="file"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={handlePictureUpload}
                      accept="image/png, image/jpeg"
                    />
                    <a href="#pablo" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="..."
                        className="rounded-circle"
                        src={profilePicUrl}
                      />
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div className="d-flex justify-content-between">
                  <Button
                    className="mr-4"
                    color="info"
                    onClick={handleUbahProfilClick}
                    size="sm"
                  >
                    Ubah Profil
                  </Button>
                  <Button
                    className="float-right"
                    color="default"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    Buang
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0 pt-md-4">
                {/* ... unchanged JSX ... */}
                <Row>
                  <div className="col">
                    <div className="card-profile-stats d-flex justify-content-center mt-md-5" />
                  </div>
                </Row>
                <div className="text-center">
                  <h7>Username</h7>
                  <h3>
                    {username}
                    <span className="font-weight-light"></span>
                  </h3>
                  <div className="d-flex justify-content-center mt-3 mb-4">
                    <Button
                      className="mx-2"
                      color="primary"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      Ubah Username
                    </Button>
                    <Button
                      className="mx-2"
                      color="secondary"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      Ubah Kata Laluan
                    </Button>
                  </div>
                  <hr className="my-4" />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My account</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                {/* ... unchanged JSX ... */}
                  <h6 className="heading-small text-muted mb-4">Info Pengguna</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-fullname">
                            Nama Penuh
                          </label>
                          <div className="form-control-plaintext" id="display-fullname">
                            {profileData?.fullname || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-age">
                            Umur
                          </label>
                          <div className="form-control-plaintext" id="display-age">
                            {profileData?.age || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-dob">
                            Tarikh Lahir
                          </label>
                          <div className="form-control-plaintext" id="display-dob">
                            {profileData?.dob || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-gender">
                            Jantina
                          </label>
                          <div className="form-control-plaintext" id="display-gender">
                            {profileData?.gender || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-race">
                            Bangsa
                          </label>
                          <div className="form-control-plaintext" id="display-race">
                            {profileData?.race || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-religion">
                            Agama
                          </label>
                          <div className="form-control-plaintext" id="display-religion">
                            {profileData?.religion || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-maritalStatus">
                            Status Perkahwinan
                          </label>
                          <div className="form-control-plaintext" id="display-maritalStatus">
                            {profileData?.status || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="display-address">
                            Alamat
                          </label>
                          <div className="form-control-plaintext" id="display-address">
                            {profileData?.address || "Loading..."}
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;