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
  if (!form.servings || Number(form.servings) <= 0)
    blockers.push("Khẩu phần phải > 0.");

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

  if (rows.length > 0 && mappedCount === 0) blockers.push("Chưa chọn nguyên liệu DB cho bất kỳ dòng nào.");
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
            <Grid item xs={12} md={8}>
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
                        onChange={(e) =>
                          handleChange("servings", Number(e.target.value) || 1)
                        }
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

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Trạng thái
                </MDTypography>

                <MDBox mt={2} display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label={`${validation.blockers.length} blocker`}
                    color={validation.blockers.length ? "error" : "success"}
                    variant="outlined"
                  />
                  <Chip
                    label={`${validation.warnings.length} warning`}
                    color={validation.warnings.length ? "warning" : "default"}
                    variant="outlined"
                  />
                  <Chip label={`Mapped: ${validation.mappedCount}/${validation.totalRows}`} variant="outlined" />
                </MDBox>

                <MDBox mt={2}>
                  <MDTypography variant="caption" color="text">
                    Bạn có thể lưu nháp bất cứ lúc nào. Xuất bản sẽ bị chặn nếu thiếu mapping/khối lượng.
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* STEP 2 */}
        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
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
                        disabled={aiLoading || !((form.instructionsText || form.description || "").trim())}
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

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Hướng dẫn nhanh
                </MDTypography>
                <MDBox mt={2} display="flex" flexDirection="column" gap={1}>
                  <Chip label="1) Dán công thức" variant="outlined" />
                  <Chip label="2) Bấm Phân tích (AI)" variant="outlined" />
                  <Chip label="3) Mapping sang DB" variant="outlined" />
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
            aiDisabled={!((form.instructionsText || form.description || "").trim())}
            onCreateIngredient={onCreateIngredient}
          />
        )}

        {/* STEP 4 */}
        {activeStep === 3 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Kiểm tra trước khi lưu
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="button" fontWeight="medium">
                  Blockers
                </MDTypography>
                <MDBox mt={1} display="flex" flexDirection="column" gap={0.75}>
                  {validation.blockers.length ? (
                    validation.blockers.slice(0, 12).map((b) => (
                      <Chip key={b} label={b} color="error" variant="outlined" />
                    ))
                  ) : (
                    <Chip label="Không có blocker 🎉" color="success" variant="outlined" />
                  )}
                </MDBox>

                <MDBox mt={2}>
                  <MDTypography variant="button" fontWeight="medium">
                    Warnings
                  </MDTypography>
                  <MDBox mt={1} display="flex" flexDirection="column" gap={0.75}>
                    {validation.warnings.length ? (
                      validation.warnings.slice(0, 12).map((w) => (
                        <Chip key={w} label={w} color="warning" variant="outlined" />
                      ))
                    ) : (
                      <Chip label="Không có warning" variant="outlined" />
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, borderRadius: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Tóm tắt
                </MDTypography>

                <MDBox mt={2} display="flex" flexWrap="wrap" gap={1}>
                  <Chip label={`Nguyên liệu: ${validation.totalRows}`} variant="outlined" />
                  <Chip label={`Mapped: ${validation.mappedCount}`} variant="outlined" />
                  <Chip
                    label={`Thiếu lượng: ${validation.missingQty}`}
                    color={validation.missingQty ? "warning" : "default"}
                    variant="outlined"
                  />
                </MDBox>

                <MDBox mt={2}>
                  <MDTypography variant="caption" color="text">
                    Mục tiêu bước này: đảm bảo đủ dữ liệu (khối lượng + mapping) để backend tính totalNutrition.
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
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

        <MDButton variant="contained" color="info" onClick={goNext} disabled={activeStep === STEPS.length - 1}>
          Tiếp theo
        </MDButton>

        <MDBox ml={2} display="flex" gap={1}>
          <MDButton variant="outlined" color="info" onClick={() => handleSave("draft")}>
            Lưu nháp
          </MDButton>

          <Tooltip title={publishBlocked ? validation.blockers.slice(0, 6).join(" • ") : "Có thể xuất bản."}>
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
