import PropTypes from "prop-types";
import { Box, Tooltip } from "@mui/material";
import MDTypography from "components/MDTypography";

export const EllipsisText = ({
  text,
  variant = "caption",
  fontWeight,
  color = "text",
  sx,            
  ...rest
}) => {
  const safe = text ?? "-";

  return (
    <Tooltip title={safe} placement="top" arrow>
      <Box component="span" sx={{ display: "block", minWidth: 0 }}>
        <MDTypography
          {...rest}
          variant={variant}
          fontWeight={fontWeight}
          color={color}
          noWrap
          sx={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ...(sx || {}),
          }}
        >
          {safe}
        </MDTypography>
      </Box>
    </Tooltip>
  );
};

EllipsisText.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,

  // ✅ thêm sx để hết warning
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};
