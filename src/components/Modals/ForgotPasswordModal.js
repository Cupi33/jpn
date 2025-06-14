// src/components/Modals/ForgotPasswordModal.js (Updated with Password Validation)

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
  // --- State for all fields in the single-step form ---
  const [username, setUsername] = useState("");
  const [citizenId, setCitizenId] = useState("");
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
    // --- Step 1: Basic validation for empty fields and password match ---
    if (!username || !citizenId || !newPassword || !confirmPassword) {
      return Swal.fire("Ralat", "Sila lengkapkan semua medan.", "error");
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Ralat", "Kata laluan baru tidak sepadan.", "error");
    }

    // --- Step 2: NEW PASSWORD VALIDATION CHECKS ---
    // Rule 1: Check for minimum length (at least 6 characters)
    if (newPassword.length < 6) {
      return Swal.fire(
        "Kata Laluan Lemah",
        "Kata laluan mestilah sekurang-kurangnya 6 aksara.",
        "warning"
      );
    }

    // Rule 2: Check for at least one digit using a regular expression
    const hasDigit = /\d/;
    if (!hasDigit.test(newPassword)) {
      return Swal.fire(
        "Kata Laluan Lemah",
        "Kata laluan mestilah mengandungi sekurang-kurangnya satu digit (0-9).",
        "warning"
      );
    }
    // --- END OF NEW VALIDATION CHECKS ---


    // --- Step 3: If all validation passes, proceed with API call ---
    try {
      const response = await axios.post("http://localhost:5000/forgetPasswordCheck", {
        username: username,
        icno: citizenId,
        password: newPassword,
      });

      if (response.data.success) {
        toggle(); // Close the modal on success
        Swal.fire("Berjaya!", "Kata laluan anda telah berjaya ditukar.", "success");
      } else {
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
          {/* Form fields remain the same */}
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