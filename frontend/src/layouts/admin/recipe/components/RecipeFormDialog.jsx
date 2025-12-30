// src/layouts/admin/recipes/components/RecipeFormDialog.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Card,
  Chip,
  Tooltip,
  Divider,
  Alert,
  Box,
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import RecipeIngredientsEditor from "./RecipeIngredientsEditor";

import { getIngredientsInAi } from "services/recipeApi";
import PropTypes from "prop-types";

const CATEGORY_OPTIONS = [
  { value: "main", label: "Món chính" },
  { value: "side", label: "Món phụ" },
  { value: "dessert", label: "Tráng miệng" },
  { value: "drink", label: "Đồ uống" },
];

const STEPS = [
  { key: "basic", label: "Thông tin cơ bản" },
  { key: "text", label: "Công thức (text)" },
  { key: "map", label: "Nguyên liệu & mapping" },
  { key: "review", label: "Kiểm tra & lưu" },
];

const emptyForm = {
  name: "",
  description: "",
  category: "main",
  servings: 1,
  imageUrl: "",
  instructionsText: "",
  ingredients: [],
};

function safeUUID() {
  return (
    (typeof crypto !== "undefined" && crypto?.randomUUID?.()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function computeValidation(form) {
  const blockers = [];
  const warnings = [];

  if (!form.name?.trim()) blockers.push("Thiếu tên món.");
  if (!form.servings || Number(form.servings) <= 0) blockers.push("Khẩu phần phải > 0.");

  const rows = Array.isArray(form.ingredients) ? form.ingredients : [];
  if (rows.length === 0) warnings.push("Chưa có nguyên liệu nào.");

  // Publish gate (tuỳ bạn dùng hay không): yêu cầu mapping + lượng để tính nutrition
  const mappedCount = rows.filter((r) => !!r.ingredientId).length;
  const missingQty = rows.filter(
    (r) =>
      r?.quantity?.amount === "" ||
      r?.quantity?.amount === null ||
      r?.quantity?.amount === undefined
  ).length;

  if (rows.length > 0 && mappedCount === 0)
    blockers.push("Chưa chọn nguyên liệu DB cho bất kỳ dòng nào.");
  if (missingQty > 0) blockers.push(`Còn ${missingQty} dòng thiếu khối lượng.`);

  return { blockers, warnings, mappedCount, missingQty, totalRows: rows.length };
}

export default function RecipeFormDialog({
  open,
  onClose,
  onSubmit,
  recipe,
  allIngredients,
  onCreateIngredient, // optional: API create ingredient
}) {
  const [form, setForm] = useState(emptyForm);
  const [activeStep, setActiveStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setActiveStep(0);
    if (recipe) {
      setForm({
        name: recipe.name || "",
        description: recipe.description || "",
        category: recipe.category || "main",
        servings: recipe.servings || 1,
        imageUrl: recipe.imageUrl || recipe.image || "",
        instructionsText: recipe.instructionsText || "",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, recipe]);

  const validation = useMemo(() => computeValidation(form), [form]);
  const publishBlocked = validation.blockers.length > 0;

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleIngredientsChange = (ingredients) => {
    setForm((p) => ({ ...p, ingredients }));
  };

  const handleAnalyzeByAI = async () => {
    const text = (form.instructionsText || form.description || "").trim();
    if (!text) return;

    try {
      setAiLoading(true);
      const aiResult = await getIngredientsInAi(text);
      const aiIngredients = aiResult?.ingredients || [];

      // IMPORTANT: name là tên ingredient đã được AI “làm sạch”, nên ta sẽ khóa sửa ở UI step 3.
      const rows = aiIngredients.map((item) => ({
        id: safeUUID(),
        source: "ai",
        name: item?.name || "",
        rawText: item?.rawText || item?.name || "",
        quantity: {
          amount: item?.quantity?.amount ?? "",
          unit: item?.quantity?.unit || "g",
          estimate: Boolean(item?.quantity?.estimate),
        },

        // mapping fields
        ingredientId: null,
        ingredientLabel: "",
        mappingName: "",
        mappingCandidates: [],
        mappingScore: null,

        flags: { optional: false },
      }));

      setForm((p) => ({ ...p, ingredients: rows }));
      setActiveStep(2);
    } catch (err) {
      console.error("AI analyze ingredients error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const goNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleSave = (status) => {
    onSubmit({ ...form, status }); // status: 'draft' | 'published' (tuỳ backend bạn)
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium">
            {recipe ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </MDTypography>

          <MDBox mt={1.5}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((s) => (
                <Step key={s.key}>
                  <StepLabel>{s.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </MDBox>
        </MDBox>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        {/* STEP 1 */}
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Thông tin cơ bản
                </MDTypography>

                <MDBox mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                      <TextField
                        fullWidth
                        label="Tên món *"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        select
                        fullWidth
                        label="Danh mục"
                        SelectProps={{ native: true }}
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
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
                        label="Khẩu phần *"
                        value={form.servings}
                        onChange={(e) => handleChange("servings", Number(e.target.value) || 1)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ảnh món (URL)"
                        placeholder="https://..."
                        value={form.imageUrl}
                        onChange={(e) => handleChange("imageUrl", e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Mô tả ngắn"
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 2 */}
        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="button" fontWeight="medium">
                    Công thức / Cách nấu (text)
                  </MDTypography>

                  <Tooltip
                    title={
                      !(form.instructionsText || form.description || "").trim()
                        ? "Nhập công thức hoặc mô tả trước."
                        : "Trích xuất nguyên liệu thô từ text."
                    }
                  >
                    <span>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={handleAnalyzeByAI}
                        disabled={
                          aiLoading || !(form.instructionsText || form.description || "").trim()
                        }
                      >
                        {aiLoading ? "Đang phân tích..." : "Phân tích nguyên liệu (AI)"}
                      </MDButton>
                    </span>
                  </Tooltip>
                </MDBox>

                <MDBox mt={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    label="Nhập hướng dẫn nấu / ingredients / notes..."
                    value={form.instructionsText}
                    onChange={(e) => handleChange("instructionsText", e.target.value)}
                  />
                </MDBox>

                <MDBox mt={2}>
                  <MDTypography variant="caption" color="text">
                    Tip: dán phần Ingredients rõ ràng giúp AI parse ổn định hơn.
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 3 */}
        {activeStep === 2 && (
          <RecipeIngredientsEditor
            ingredients={form.ingredients}
            onChange={handleIngredientsChange}
            allIngredients={allIngredients}
            onAnalyzeByAI={handleAnalyzeByAI}
            aiLoading={aiLoading}
            aiDisabled={!(form.instructionsText || form.description || "").trim()}
            onCreateIngredient={onCreateIngredient}
          />
        )}

        {/* STEP 4 - REVIEW */}
        {activeStep === 3 && (
          <Grid container spacing={2.5}>
            {/* Thông tin món ăn */}
            <Grid item xs={12}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Thông tin món ăn
                </MDTypography>

                <Grid container spacing={2}>
                  {/* Ảnh món ăn */}
                  {form.imageUrl && (
                    <Grid item xs={12} md={3}>
                      <Box
                        component="img"
                        src={form.imageUrl}
                        alt={form.name}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </Grid>
                  )}

                  {/* Thông tin cơ bản */}
                  <Grid item xs={12} md={form.imageUrl ? 9 : 12}>
                    <MDBox display="flex" flexDirection="column" gap={1.5}>
                      <MDBox>
                        <MDTypography variant="caption" color="text" fontWeight="medium">
                          Tên món ăn
                        </MDTypography>
                        <MDTypography variant="body1" fontWeight="medium">
                          {form.name || "(Chưa có tên)"}
                        </MDTypography>
                      </MDBox>

                      <MDBox display="flex" gap={3} alignItems="center" flexWrap="wrap">
                        <MDBox display="flex" alignItems="center" gap={1}>
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            Danh mục:
                          </MDTypography>
                          <Chip
                            label={
                              CATEGORY_OPTIONS.find((o) => o.value === form.category)?.label ||
                              form.category ||
                              "-"
                            }
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </MDBox>

                        <MDBox display="flex" alignItems="center" gap={1}>
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            Khẩu phần:
                          </MDTypography>
                          <MDTypography variant="body1" fontWeight="medium">
                            {form.servings || 1} người
                          </MDTypography>
                        </MDBox>
                      </MDBox>

                      {form.description && (
                        <MDBox>
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            Mô tả
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            {form.description}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Validation Status */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Trạng thái kiểm tra
                </MDTypography>

                <MDBox flex={1} display="flex" flexDirection="column" gap={2}>
                  {validation.blockers.length > 0 ? (
                    <Alert severity="error">
                      <MDTypography variant="button" fontWeight="medium" mb={1}>
                        Có lỗi cần sửa:
                      </MDTypography>
                      <MDBox component="ul" sx={{ m: 0, pl: 2 }}>
                        {validation.blockers.map((b, idx) => (
                          <MDTypography key={idx} component="li" variant="caption">
                            {b}
                          </MDTypography>
                        ))}
                      </MDBox>
                    </Alert>
                  ) : (
                    <Alert severity="success">Không có lỗi nào! Bạn có thể xuất bản món ăn.</Alert>
                  )}

                  {validation.warnings.length > 0 && (
                    <Alert severity="warning">
                      <MDTypography variant="button" fontWeight="medium" mb={1}>
                        Cảnh báo ({validation.warnings.length}):
                      </MDTypography>
                      <MDBox component="ul" sx={{ m: 0, pl: 2 }}>
                        {validation.warnings.map((w, idx) => (
                          <MDTypography key={idx} component="li" variant="caption">
                            {w}
                          </MDTypography>
                        ))}
                      </MDBox>
                    </Alert>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Thống kê nguyên liệu */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Thống kê nguyên liệu
                </MDTypography>

                <MDBox
                  flex={1}
                  display="flex"
                  flexDirection="column"
                  gap={1.5}
                  justifyContent="center"
                >
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="body2" color="text">
                      Tổng số nguyên liệu:
                    </MDTypography>
                    <Chip
                      label={validation.totalRows}
                      color={validation.totalRows > 0 ? "info" : "default"}
                      size="small"
                    />
                  </MDBox>

                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="body2" color="text">
                      Thiếu khối lượng:
                    </MDTypography>
                    <Chip
                      label={validation.missingQty}
                      color={validation.missingQty === 0 ? "success" : "warning"}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Danh sách nguyên liệu */}
            {form.ingredients && form.ingredients.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ p: 2.5, borderRadius: 2 }}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Danh sách nguyên liệu ({form.ingredients.length})
                  </MDTypography>

                  <MDBox
                    sx={{
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Grid container spacing={1}>
                      {form.ingredients.map((ing, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <MDBox
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: ing.ingredientId ? "success.lighter" : "grey.100",
                              border: "1px solid",
                              borderColor: ing.ingredientId ? "success.main" : "grey.300",
                            }}
                          >
                            <MDTypography variant="caption" fontWeight="medium">
                              {ing.name ||
                                ing.ingredientLabel ||
                                ing.mappingName ||
                                "(Chưa có tên)"}
                            </MDTypography>
                            {ing.quantity?.amount && (
                              <MDTypography variant="caption" color="text" display="block">
                                {ing.quantity.amount} {ing.quantity.unit || "g"}
                              </MDTypography>
                            )}
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            )}

            {/* Hướng dẫn nấu */}
            {form.instructionsText && (
              <Grid item xs={12}>
                <Card sx={{ p: 2.5, borderRadius: 2 }}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Hướng dẫn nấu
                  </MDTypography>
                  <MDBox
                    sx={{
                      p: 1.5,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <MDTypography variant="body2" color="text" sx={{ whiteSpace: "pre-wrap" }}>
                      {form.instructionsText}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <MDButton color="secondary" variant="outlined" onClick={onClose}>
          Hủy
        </MDButton>

        <MDBox flex={1} />

        <MDButton variant="outlined" color="info" onClick={goBack} disabled={activeStep === 0}>
          Quay lại
        </MDButton>

        <MDButton
          variant="contained"
          color="info"
          onClick={goNext}
          disabled={activeStep === STEPS.length - 1}
        >
          Tiếp theo
        </MDButton>

        <MDBox ml={2} display="flex" gap={1}>
          <MDButton variant="outlined" color="info" onClick={() => handleSave("draft")}>
            Lưu nháp
          </MDButton>

          <Tooltip
            title={
              publishBlocked ? validation.blockers.slice(0, 6).join(" • ") : "Có thể xuất bản."
            }
          >
            <span>
              <MDButton
                color="info"
                variant="contained"
                onClick={() => handleSave("published")}
                disabled={publishBlocked}
              >
                Xuất bản
              </MDButton>
            </span>
          </Tooltip>
        </MDBox>
      </DialogActions>
    </Dialog>
  );
}

RecipeFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  recipe: PropTypes.any,
  allIngredients: PropTypes.array.isRequired,
  onCreateIngredient: PropTypes.func, // optional
};

RecipeFormDialog.defaultProps = {
  recipe: null,
  onCreateIngredient: undefined,
};
