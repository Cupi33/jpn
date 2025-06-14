// src/components/Modals/ForgotPasswordModal.js (Adjusted for your /forgetPasswordCheck API)

import { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";

const ForgotPasswordModal = ({ isOpen, toggle }) => {
  // State variables in the front-end (names don't need to change)
  const [username, setUsername] = useState("");
  const [citizenId, setCitizenId] = useState(""); // This holds the IC number
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // This effect resets the form whenever the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setUsername("");
        setCitizenId("");
        setNewPassword("");
        setConfirmPassword("");
      }, 300); // Delay to avoid visual glitch
    }
  }, [isOpen]);

  const handleVerifyAndReset = async () => {
    // Client-side validation first
    if (!username || !citizenId || !newPassword || !confirmPassword) {
      return Swal.fire("Ralat", "Sila lengkapkan semua medan.", "error");
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Ralat", "Kata laluan baru tidak sepadan.", "error");
    }

    try {
      // --- CHANGE 1: Use your existing API endpoint ---
      const response = await axios.post("http://localhost:5000/forgetPasswordCheck", {
        
        // --- CHANGE 2: Match the payload keys to what your backend expects ---
        username: username,         // Backend expects 'username' -> We send 'username'
        icno: citizenId,            // Backend expects 'icno' -> We send the value from our 'citizenId' state
        password: newPassword,      // Backend expects 'password' for the new pass -> We send 'newPassword'
      });

      if (response.data.success) {
        toggle(); // Close the modal on success
        Swal.fire("Berjaya!", "Kata laluan anda telah berjaya ditukar.", "success");
      } else {
        // Show the specific error message from the backend (e.g., "Maklumat tidak dijumpai")
        Swal.fire("Gagal", response.data.message || "Maklumat tidak sah atau ralat berlaku.", "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Gagal menghubungi pelayan.";
      Swal.fire("Oops!", errorMessage, "error");
      console.error("Password reset error:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Tukar Kata Laluan</ModalHeader>
      <ModalBody>
        <Form>
          <p>Sila masukkan maklumat anda dan kata laluan baru.</p>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-3">
              <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-single-02" /></InputGroupText></InputGroupAddon>
              <Input placeholder="Nama Pengguna" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-3">
              <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-badge" /></InputGroupText></InputGroupAddon>
              <Input placeholder="Nombor Kad Pengenalan" type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
            </InputGroup>
          </FormGroup>
          <hr className="my-4" />
          <FormGroup>
            <InputGroup className="input-group-alternative mb-3">
              <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
              <Input placeholder="Kata Laluan Baru" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
              <Input placeholder="Sahkan Kata Laluan Baru" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </InputGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleVerifyAndReset}>Tukar Kata Laluan</Button>
        <Button color="secondary" onClick={toggle}>Batal</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ForgotPasswordModal;