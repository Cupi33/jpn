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
  Spinner // 👈 1. Import Spinner for a better loading indicator
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "components/Headers/UserHeader.js";

const Profile = () => {
  const [citizenID, setCitizenID] = useState("");
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState(null);

  // 👇 2. Initialize the picture URL to null and add a loading state.
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 👇 3. Refactor useEffect to coordinate all data fetching before rendering.
  useEffect(() => {
    const storedCitizenID = sessionStorage.getItem("citizenID");
    const storedUsername = sessionStorage.getItem("username");

    if (!storedCitizenID || !storedUsername) {
      navigate("/authCitizen/login");
      return; // Exit early if not logged in
    }

    setCitizenID(storedCitizenID);
    setUsername(storedUsername);

    const fetchData = async () => {
      try {
        // Create promises for both API calls
        const profileDataPromise = axios.post("http://localhost:5000/profile/profile", { citizenID: storedCitizenID });
        
        // We add a .catch to the picture promise. This is important!
        // It prevents Promise.all from failing if the picture just doesn't exist (404).
        const profilePicturePromise = axios.get(`http://localhost:5000/profile/get-picture/${storedCitizenID}`, { responseType: 'blob' })
          .catch(error => {
            console.log("No profile picture found, will use default.");
            return null; // Instead of an error, we return null.
          });

        // Use Promise.all to wait for both fetches to complete
        const [profileResponse, pictureResponse] = await Promise.all([
          profileDataPromise,
          profilePicturePromise
        ]);

        // Process the results now that we have them both
        if (profileResponse.data.success) {
          setProfileData(profileResponse.data.user);
        } else {
          console.error("Failed to fetch profile data:", profileResponse.data.message);
        }

        if (pictureResponse) {
          // If pictureResponse is not null, a picture was found
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePicUrl(imageUrl);
        } else {
          // If pictureResponse is null, use the default picture
          setProfilePicUrl(require("../../assets/img/theme/team-4-800x800.jpg"));
        }

      } catch (error) {
        console.error("An unexpected error occurred during data fetching:", error);
        // In case of a major error, still use the default picture
        setProfilePicUrl(require("../../assets/img/theme/team-4-800x800.jpg"));
      } finally {
        // VERY IMPORTANT: Set loading to false after all operations are done.
        setIsProfileLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // This function doesn't need to change
  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setProfilePicUrl(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('citizenID', citizenID);
    try {
      const response = await axios.put('http://localhost:5000/profile/upload-picture', formData);
      if (response.data.success) {
        alert('Profile picture updated successfully!');
      } else {
        alert('Failed to update picture: ' + response.data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('An error occurred while uploading the picture.');
    }
  };

  const handleUbahProfilClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      {/* The header can render immediately with the username */}
      <UserHeader name={profileData?.fullname || username} />
      
      <Container className="mt--7" fluid>
        <Row>
          {/* 👇 4. Use the loading state to conditionally render the content */}
          {isProfileLoading ? (
            <Col className="text-center p-5">
              <Spinner color="primary" />
            </Col>
          ) : (
            <>
              {/* This content will only appear AFTER loading is complete */}
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
                      <Button className="mr-4" color="info" onClick={handleUbahProfilClick} size="sm">
                        Ubah Profil
                      </Button>
                      <Button className="float-right" color="default" onClick={(e) => e.preventDefault()} size="sm">
                        Buang
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 pt-md-4">
                    <Row>
                      <div className="col">
                        <div className="card-profile-stats d-flex justify-content-center mt-md-5" />
                      </div>
                    </Row>
                    <div className="text-center">
                      <h7>Username</h7>
                      <h3>{username}<span className="font-weight-light"></span></h3>
                      <div className="d-flex justify-content-center mt-3 mb-4">
                        <Button className="mx-2" color="primary" onClick={(e) => e.preventDefault()} size="sm">
                          Ubah Username
                        </Button>
                        <Button className="mx-2" color="secondary" onClick={(e) => e.preventDefault()} size="sm">
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
                      <Col xs="8"><h3 className="mb-0">My account</h3></Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <h6 className="heading-small text-muted mb-4">Info Pengguna</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-fullname">Nama Penuh</label><div className="form-control-plaintext" id="display-fullname">{profileData?.fullname || "..."}</div></FormGroup></Col>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-age">Umur</label><div className="form-control-plaintext" id="display-age">{profileData?.age || "..."}</div></FormGroup></Col>
                        </Row>
                        <Row>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-dob">Tarikh Lahir</label><div className="form-control-plaintext" id="display-dob">{profileData?.dob || "..."}</div></FormGroup></Col>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-gender">Jantina</label><div className="form-control-plaintext" id="display-gender">{profileData?.gender || "..."}</div></FormGroup></Col>
                        </Row>
                        <Row>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-race">Bangsa</label><div className="form-control-plaintext" id="display-race">{profileData?.race || "..."}</div></FormGroup></Col>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-religion">Agama</label><div className="form-control-plaintext" id="display-religion">{profileData?.religion || "..."}</div></FormGroup></Col>
                        </Row>
                        <Row>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-maritalStatus">Status Perkahwinan</label><div className="form-control-plaintext" id="display-maritalStatus">{profileData?.status || "..."}</div></FormGroup></Col>
                          <Col lg="6"><FormGroup><label className="form-control-label" htmlFor="display-address">Alamat</label><div className="form-control-plaintext" id="display-address">{profileData?.address || "..."}</div></FormGroup></Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Profile;