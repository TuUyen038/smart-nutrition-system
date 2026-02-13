import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox"; // Dùng để spacing
import PropTypes from "prop-types";

function DeleteUserDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message,
  itemName,
  loading = false,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const isError = touched && reason.trim().length === 0;
  useEffect(() => {
    if (!open) {
      setReason("");
      setTouched(false); // Reset khi đóng
    }
  }, [open]);
  const handleConfirm = () => {
    // Truyền lý do về hàm callback onConfirm
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDTypography variant="h6" fontWeight="medium">
          {title}
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <MDBox mb={2}>
          <DialogContentText>
            {message || (
              <>
                Bạn có chắc chắn muốn xóa {itemName && <strong>&quot;{itemName}&quot;</strong>}?
                <br />
                Hành động này không thể hoàn tác.
              </>
            )}
          </DialogContentText>
        </MDBox>

        <MDBox mt={2}>
          <TextField
            fullWidth
            label="Lý do xóa"
            placeholder="Nhập lý do để tiếp tục..."
            multiline
            rows={3}
            value={reason}
            onBlur={() => setTouched(true)} // Đánh dấu đã chạm vào khi admin click ra ngoài
            onChange={(e) => {
              setReason(e.target.value);
              if (!touched) setTouched(true); // Đánh dấu đã chạm khi bắt đầu gõ
            }}
            disabled={loading}
            error={isError} // Chỉ đỏ khi có lỗi thực sự sau khi đã tương tác
            helperText={
              isError
                ? "Vui lòng nhập lý do để xác nhận"
                : "Lý do này sẽ được lưu vào hệ thống Audit Log"
            }
          />
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" color="secondary" onClick={onClose} disabled={loading}>
          Hủy
        </MDButton>
        <MDButton
          variant="contained"
          color="error"
          onClick={handleConfirm}
          // Disable nếu đang load HOẶC chưa nhập lý do
          disabled={loading || !reason.trim()}
        >
          {loading ? "Đang xử lý..." : "Xác nhận xóa"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired, // Hàm này giờ sẽ nhận tham số là reason
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  loading: PropTypes.bool,
};

export default DeleteUserDialog;
