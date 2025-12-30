import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message,
  itemName,
  loading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <MDTypography variant="h6" fontWeight="medium">
          {title}
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message || (
            <>
              Bạn có chắc chắn muốn xóa{" "}
              {itemName && <strong>&quot;{itemName}&quot;</strong>}?
              <br />
              <br />
              Hành động này không thể hoàn tác.
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </MDButton>
        <MDButton
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  loading: PropTypes.bool,
};

export default DeleteConfirmDialog;

