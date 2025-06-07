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
  Spinner
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "components/Headers/UserHeader.js";
import Swal from 'sweetalert2';
// 👇 Import both modal components
import ChangeUsernameModal from "../../components/Modals/ChangeUsername";
import ChangePasswordModal from "../../components/Modals/changePassword";

const Profile = () => {
  const [citizenID, setCitizenID] = useState("");
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // State for Change Username Modal
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  // 👇 State for the new Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCitizenID = sessionStorage.getItem("citizenID");
    const storedUsername = sessionStorage.getItem("username");

    if (!storedCitizenID || !storedUsername) {
      navigate("/authCitizen/login");
      return;
    }

    setCitizenID(storedCitizenID);
    setUsername(storedUsername);

    const fetchData = async () => {
      try {
        const profileDataPromise = axios.post("http://localhost:5000/profile/profile", { citizenID: storedCitizenID });
        const profilePicturePromise = axios.get(`http://localhost:5000/profile/get-picture/${storedCitizenID}`, { responseType: 'blob' })
          .catch(error => {
            console.log("Tiada gambar profil yang dijumpai");
            return null;
          });

        const [profileResponse, pictureResponse] = await Promise.all([
          profileDataPromise,
          profilePicturePromise
        ]);

        if (profileResponse.data.success) {
          setProfileData(profileResponse.data.user);
        } else {
          console.error("Gagal mendapatkan gambar profil dari database:", profileResponse.data.message);
        }

        if (pictureResponse) {
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePicUrl(imageUrl);
        } else {
          setProfilePicUrl(require("../../assets/img/theme/team-4-800x800.jpg"));
        }

      } catch (error) {
        console.error("An unexpected error occurred during data fetching:", error);
        setProfilePicUrl(require("../../assets/img/theme/team-4-800x800.jpg"));
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
        Swal.fire({
          icon: 'success',
          title: 'Berjaya!',
          text: 'Gambar profil berjaya dimuat naik',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gambar profil gagal dimuat naik: ' + response.data.message
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: 'Isu Memuat Naik gambar profil. Sila cuba sebentar lagi.'
      });
    }
  };

  const handleUbahProfilClick = () => {
    fileInputRef.current.click();
  };

  // Toggler for username modal
  const toggleChangeUsernameModal = () => setIsUsernameModalOpen(!isUsernameModalOpen);
  
  // 👇 Toggler for the new password modal
  const toggleChangePasswordModal = () => setIsPasswordModalOpen(!isPasswordModalOpen);

  // Handler for successful username update
  const handleUsernameUpdated = (updatedUsername) => {
    setUsername(updatedUsername);
    sessionStorage.setItem("username", updatedUsername);
  };

  return (
    <>
      <UserHeader name={profileData?.fullname || username} />
      
      <Container className="mt--7" fluid>
        <Row>
          {isProfileLoading ? (
            <Col className="text-center p-5">
              <Spinner color="primary" />
            </Col>
          ) : (
            <>
              {/* ... All existing correct JSX ... */}
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
                        <Button className="mx-2" color="primary" onClick={toggleChangeUsernameModal} size="sm">
                          Ubah Username
                        </Button>
                        {/* 👇 Updated button to open the new password modal */}
                        <Button className="mx-2" color="secondary" onClick={toggleChangePasswordModal} size="sm">
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
      
      {/* Render the username modal component */}
      <ChangeUsernameModal
        isOpen={isUsernameModalOpen}
        toggle={toggleChangeUsernameModal}
        citizenID={citizenID}
        currentUsername={username}
        onUsernameUpdate={handleUsernameUpdated}
      />

      {/* 👇 Render the new password modal component */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        toggle={toggleChangePasswordModal}
        username={username}
      />
    </>
  );
};

export default Profile;