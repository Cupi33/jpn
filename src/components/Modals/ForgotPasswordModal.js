// src/components/Modals/ForgotPasswordModal.js

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

// The component receives 'isOpen' and 'toggle' as props from its parent (Login.js)
const ForgotPasswordModal = ({ isOpen, toggle }) => {
  // --- All state related to the modal now lives inside this component ---
  const [modalStep, setModalStep] = useState(1);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotCitizenId, setForgotCitizenId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- This effect resets the form whenever the modal is closed ---
  useEffect(() => {
    if (!isOpen) {
      // Add a small delay to prevent visual glitch while modal closes
      setTimeout(() => {
        setModalStep(1);
        setForgotUsername("");
        setForgotCitizenId("");
        setNewPassword("");
        setConfirmPassword("");
      }, 300);
    }
  }, [isOpen]);

  // --- Handler functions are also moved here ---
  const handleVerifyUser = async () => {
    if (!forgotUsername || !forgotCitizenId) {
      return Swal.fire("Ralat", "Sila masukkan Nama Pengguna dan Nombor Kad Pengenalan.", "error");
    }
    try {
      const response = await axios.post("http://localhost:5000/verify-user", {
        username: forgotUsername,
        citizenID: forgotCitizenId,
      });

      if (response.data.success) {
        setModalStep(2); // Move to the next step
      } else {
        Swal.fire("Gagal", response.data.message || "Nama Pengguna atau Nombor Kad Pengenalan tidak sepadan.", "error");
      }
    } catch (error) {
      Swal.fire("Oops!", "Gagal menghubungi pelayan untuk pengesahan.", "error");
      console.error("Verification error:", error);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Swal.fire("Ralat", "Sila masukkan dan sahkan kata laluan baru.", "error");
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Ralat", "Kata laluan baru tidak sepadan.", "error");
    }

    try {
      const response = await axios.post("http://localhost:5000/reset-password", {
        username: forgotUsername, // Use the verified username
        newPassword: newPassword,
      });

      if (response.data.success) {
        toggle(); // Close the modal using the function passed from the parent
        Swal.fire("Berjaya!", "Kata laluan anda telah berjaya ditukar.", "success");
      } else {
        Swal.fire("Gagal", response.data.message || "Gagal menukar kata laluan.", "error");
      }
    } catch (error) {
      Swal.fire("Oops!", "Gagal menghubungi pelayan untuk menukar kata laluan.", "error");
      console.error("Password reset error:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Lupa Kata Laluan</ModalHeader>
      <ModalBody>
        {modalStep === 1 && (
          <Form>
            <p>Sila masukkan nama pengguna dan nombor kad pengenalan anda untuk pengesahan.</p>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-single-02" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nama Pengguna" type="text" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-badge" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nombor Kad Pengenalan" type="text" value={forgotCitizenId} onChange={(e) => setForgotCitizenId(e.target.value)} />
              </InputGroup>
            </FormGroup>
          </Form>
        )}

        {modalStep === 2 && (
          <Form>
            <p>Pengesahan berjaya. Sila masukkan kata laluan baru anda.</p>
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
        )}
      </ModalBody>
      <ModalFooter>
        {modalStep === 1 && (
          <Button color="primary" onClick={handleVerifyUser}>Sahkan</Button>
        )}
        {modalStep === 2 && (
          <Button color="primary" onClick={handleResetPassword}>Tukar Kata Laluan</Button>
        )}
        <Button color="secondary" onClick={toggle}>Batal</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ForgotPasswordModal;