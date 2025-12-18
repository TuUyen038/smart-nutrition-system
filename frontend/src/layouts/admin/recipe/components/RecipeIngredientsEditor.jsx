import {
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import PropTypes from "prop-types";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { fetchIngredientsNutrition } from "services/mappingModelApi";
import { useState } from "react";
import MDButton from "components/MDButton";

const UNIT_OPTIONS = ["g", "kg", "ml", "l", "tbsp", "tsp", "cup", "unit"];

export default function RecipeIngredientsEditor({
  ingredients,
  onChange,
  allIngredients,
  onAnalyzeByAI,
  aiLoading,
  aiDisabled,
}) {
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [mappingVisible, setMappingVisible] = useState(false);
  console.log('RecipeIngredientsEditor rendered with ingredients:', ingredients);
  const handleRowChange = (index, fieldPath, value) => {
    const next = [...ingredients];
    const row = { ...next[index] };

    if (fieldPath === "name") {
      row.name = value;
    } else if (fieldPath === "amount") {
      row.quantity = {
        ...(row.quantity || {}),
        amount: Number(value) || "",
      };
    } else if (fieldPath === "unit") {
      row.quantity = {
        ...(row.quantity || {}),
        unit: value,
      };
    } else if (fieldPath === "ingredientId") {
      row.ingredientId = value;
    }

    next[index] = row;
    onChange(next);
  };

  const handleAddRow = () => {
    onChange([
      ...ingredients,
      {
        name: "",
        ingredientId: null,
        quantity: { amount: "", unit: "g" },
        mappingName: "",
        mappingSuggestion: null,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const next = ingredients.filter((_, i) => i !== index);
    onChange(next);
  };

  // Mapping từ model dinh dưỡng: dùng tên thô -> gợi ý tên chuẩn
  const handleMappingFromNutritionDb = async () => {
    if (!ingredients || !ingredients.length) return;

    try {
      setSuggestLoading(true);
      setMappingVisible(true);

      // API yêu cầu mảng object { name }, hiện tại ingredients đã có field name
      const rawResults = await fetchIngredientsNutrition(ingredients, 3);
      // rawResults: [{ input, results: [...] }, ...]

      const next = [...ingredients];

      rawResults.forEach((item, idx) => {
        const top = item?.results?.[0];
        if (!top || !next[idx]) return;

        // đoán tên chuẩn theo các key thường gặp, bạn chỉnh theo real API
        const canonicalName =
          top.name_vi ||
          top.food_name_vn ||
          top.name ||
          next[idx].name;

        next[idx] = {
          ...next[idx],
          mappingName: canonicalName,
          mappingSuggestion: top, // lưu lại full kết quả để dùng sau nếu cần
        };
      });

      onChange(next);
    } catch (err) {
      console.error("Mapping ingredient from nutrition DB error:", err);
    } finally {
      setSuggestLoading(false);
    }
  };


  return (
    <MDBox>
      <MDTypography variant="button" fontWeight="medium">
        Nguyên liệu cho món ăn
      </MDTypography>

      <MDBox mt={2}>
        <Grid container spacing={2}>
          {/* PANEL TRÁI: NGUYÊN LIỆU THÔ */}
          <Grid item xs={12}>
            <MDBox
              borderRadius={2}
              border="1px solid #eee"
              p={2}
              height="100%"
            >
              <MDBox
                mb={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="button" fontWeight="medium">
                  Nguyên liệu thô
                </MDTypography>

                <MDBox display="flex" gap={1}>
                  {/* Nút AI */}
                  <Tooltip
                    title={
                      aiDisabled
                        ? "Nhập mô tả hoặc công thức trước khi phân tích."
                        : "Trích xuất danh sách nguyên liệu từ mô tả/công thức."
                    }
                    placement="top"
                  >
                    {/* Tooltip với button disabled cần bọc span */}
                    <span>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={onAnalyzeByAI}
                        disabled={aiLoading || aiDisabled}
                      >
                        {aiLoading ? "Đang phân tích..." : "Phân tích bằng AI"}
                      </MDButton>
                    </span>
                  </Tooltip>

                  {/* Nút thêm */}
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    sx={{
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "info.main", 
                        color: "#fff",
                        borderColor: "info.main",
                      },
                    }}
                  >
                    Thêm nguyên liệu
                  </MDButton>

                </MDBox>
              </MDBox>


              {ingredients && ingredients.length > 0 ? (
                ingredients.map((row, index) => (

                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    key={index}
                    sx={{ mb: 2 }}
                  >
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Tên nguyên liệu thô"
                        value={row.name || ""}
                        onChange={(e) =>
                          handleRowChange(index, "name", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Số lượng"
                        value={row.quantity?.amount ?? ""}
                        onChange={(e) =>
                          handleRowChange(index, "amount", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        sx={{
                          label: {
                            pb: 1,
                          },
                          ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                            lineHeight: "3.1",
                          },
                        }}
                        select
                        fullWidth
                        size="small"
                        label="Đơn vị"
                        value={row.quantity?.unit || "g"}
                        onChange={(e) =>
                          handleRowChange(index, "unit", e.target.value)
                        }
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <MenuItem key={u} value={u}>
                            {u}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Xóa dòng">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRow(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>

                  </Grid>
                ))
              ) : (
                <MDTypography variant="caption" color="text">
                  Chưa có nguyên liệu nào. Bạn có thể chọn &quot;Thêm nguyên liệu&quot;
                  hoặc chọn &quot;Phân tích bằng AI&quot; để hệ thống tự động gợi ý nguyên liệu dựa vào công thức bạn đã nhập ở trên.
                </MDTypography>
              )}
            </MDBox>
          </Grid>

          <Grid item xs={12}>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={handleMappingFromNutritionDb}
              disabled={suggestLoading || !ingredients.length}
            >
              {suggestLoading
                ? "Đang mapping..."
                : "Mapping"}
            </MDButton>
          </Grid>


          {/* PANEL PHẢI: NGUYÊN LIỆU SAU MAPPING */}
          <Grid item xs={12}>
            <MDBox
              borderRadius={2}
              border="1px solid #eee"
              p={2}
              height="100%"
            >
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <div>
                  <MDTypography variant="button" fontWeight="medium">
                    Nguyên liệu mapping
                  </MDTypography>

                </div>


              </MDBox>

              <Divider sx={{ mb: 1 }} />

              {mappingVisible || ingredients.some((r) => r.mappingName) ? (
                <>
                  {ingredients && ingredients.length > 0 ? (
                    ingredients.map((row, index) => (
                      <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        key={index}
                        sx={{ mb: 2 }}
                      >
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Tên nguyên liệu đã mapping (gợi ý)"
                            value={row.mappingName || ""}
                            InputProps={{ readOnly: true }}
                            placeholder="Chưa có gợi ý mapping"
                          />
                        </Grid>
                      </Grid>
                    ))
                  ) : (
                    <MDTypography variant="caption" color="text">
                      Chưa có nguyên liệu nào để mapping.
                    </MDTypography>
                  )}

                  <MDBox mt={1}>
                    <MDButton
                      color="info"
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddRow}
                    >
                      Thêm nguyên liệu
                    </MDButton>
                  </MDBox>
                </>
              ) : (
                <MDTypography variant="caption" color="text">
                  Chưa mapping. Hãy bấm &quot;Mapping từ bảng dinh dưỡng&quot; sau khi
                  đã có danh sách nguyên liệu thô.
                </MDTypography>
              )}
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

RecipeIngredientsEditor.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      ingredientId: PropTypes.string,
      quantity: PropTypes.shape({
        amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        unit: PropTypes.string,
      }),
      mappingName: PropTypes.string,
      mappingSuggestion: PropTypes.any,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  allIngredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      name_en: PropTypes.string,
    })
  ).isRequired,
  onAnalyzeByAI: PropTypes.func,
  aiLoading: PropTypes.bool,
  aiDisabled: PropTypes.bool,

};
