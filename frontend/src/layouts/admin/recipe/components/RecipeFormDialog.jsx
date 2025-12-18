// src/layouts/admin/recipes/components/RecipeFormDialog.jsx
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import RecipeIngredientsEditor from "./RecipeIngredientsEditor";
import { getIngredientsInAi } from "services/recipeApi"
import PropTypes from "prop-types";
import MDButton from "components/MDButton";

const CATEGORY_OPTIONS = [
  { value: "main", label: "Món chính" },
  { value: "side", label: "Món phụ" },
  { value: "dessert", label: "Tráng miệng" },
  { value: "drink", label: "Đồ uống" },
];

const emptyForm = {
  name: "",
  description: "",
  category: "main",
  servings: 1,
  instructionsText: "",
  ingredients: [], // { name, ingredientId, quantity: { amount, unit } }
};

export default function RecipeFormDialog({
  open,
  onClose,
  onSubmit,
  recipe,
  allIngredients,
}) {
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (recipe) {
        setForm({
          name: recipe.name || "",
          description: recipe.description || "",
          category: recipe.category || "main",
          servings: recipe.servings || 1,
          instructionsText: recipe.instructionsText || "",
          ingredients: recipe.ingredients || [],
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, recipe]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleIngredientsChange = (ingredients) => {
    setForm((prev) => ({ ...prev, ingredients }));
  };

  const handleAnalyzeByAI = async () => {
    const text = (form.instructionsText || form.description || "").trim();
    if (!text) return;

    try {
      setAiLoading(true);

      const aiResult = await getIngredientsInAi(text);
      const aiIngredients = aiResult?.ingredients || [];

      const mapped = aiIngredients.map((item) => ({
        name: item.name,
        ingredientId: null,
        quantity: {
          amount: item?.quantity?.amount ?? "",
          unit: item?.quantity?.unit || "g",
        },
        mappingName: "",
        mappingSuggestion: null,
      }));

      handleIngredientsChange(mapped);
    } catch (err) {
      console.error("AI analyze ingredients error:", err);
    } finally {
      setAiLoading(false);
    }
  };


  const handleSave = () => {
    onSubmit(form);
  };

  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {recipe ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
      </DialogTitle>
      <DialogContent dividers>
        <MDBox mt={1}>
          <Grid container spacing={3}>
            {/* Top: thông tin cơ bản + công thức */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <MDBox mb={2}>
                    <TextField
                      fullWidth
                      label="Tên món"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Danh mục"
                    SelectProps={{ native: true }}
                    value={form.category}
                    onChange={(e) =>
                      handleChange("category", e.target.value)
                    }
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Khẩu phần"
                    value={form.servings}
                    onChange={(e) =>
                      handleChange("servings", Number(e.target.value) || 1)
                    }
                  />
                </Grid>
              </Grid>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Mô tả ngắn"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </MDBox>

              <MDBox mt={3}>
                <MDTypography variant="button" fontWeight="medium">
                  Công thức / Cách nấu
                </MDTypography>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  placeholder="Nhập từng bước nấu, mỗi bước một dòng..."
                  value={form.instructionsText}
                  onChange={(e) =>
                    handleChange("instructionsText", e.target.value)
                  }
                  sx={{ mt: 1 }}
                />
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={handleAnalyzeByAI}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? "Đang phân tích nguyên liệu..."
                    : "Phân tích nguyên liệu bằng AI"}
                </MDButton>
              </MDBox>
            </Grid>

            {/* Bottom: quản lý nguyên liệu + mapping */}
            <Grid item xs={12}>
              <RecipeIngredientsEditor
                ingredients={form.ingredients}
                onChange={handleIngredientsChange}
                allIngredients={allIngredients}
                onAnalyzeByAI={handleAnalyzeByAI}
                aiLoading={aiLoading}
                aiDisabled={!((form.instructionsText || form.description || "").trim())}
              />
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton color="secondary" variant="outlined" onClick={onClose}>Hủy</MDButton>
        <MDButton color="info" onClick={handleSave} variant="contained">
          Lưu
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}
RecipeFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  recipe: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    servings: PropTypes.number,
    instructionsText: PropTypes.string,
    ingredients: PropTypes.array,
  }),
  allIngredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      name_en: PropTypes.string,
    })
  ).isRequired,
};

RecipeFormDialog.defaultProps = {
  recipe: null,
};
