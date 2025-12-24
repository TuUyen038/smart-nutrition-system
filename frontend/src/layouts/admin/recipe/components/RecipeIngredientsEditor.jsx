import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import PropTypes from "prop-types";
import { fetchIngredientsNutrition } from "services/mappingModelApi";

const LS_ALIAS_KEY = "recipe_ing_alias_v1"; // rawNameNormalized -> { ingredientId, label }

function normalizeText(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function safeUUID() {
  return (
    (typeof crypto !== "undefined" && crypto?.randomUUID?.()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function loadAlias() {
  try {
    const raw = localStorage.getItem(LS_ALIAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAlias(map) {
  try {
    localStorage.setItem(LS_ALIAS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// convert unit -> gram (chỉ làm chắc chắn cho g/kg; unit khác để admin tự chỉnh)
function toGram(amount, unit) {
  const a = Number(amount);
  if (!Number.isFinite(a)) return "";
  if (unit === "g" || !unit) return a;
  if (unit === "kg") return a * 1000;
  return "";
}

function extractTopName(top) {
  return top?.name_vi || top?.food_name_vn || top?.name || "";
}

function extractScore(top) {
  const s =
    top?.score ?? top?.similarity ?? top?.cosine ?? top?.confidence ?? null;
  if (typeof s === "number") return Math.max(0, Math.min(1, s));

  const d = top?.distance ?? top?.dist ?? null;
  if (typeof d === "number") {
    const approx = 1 / (1 + d);
    return Math.max(0, Math.min(1, approx));
  }
  return null;
}

export default function RecipeIngredientsEditor({
  ingredients,
  onChange,
  allIngredients,
  onAnalyzeByAI,
  aiLoading,
  aiDisabled,
  onCreateIngredient,
}) {
  const rows = Array.isArray(ingredients) ? ingredients : [];

  // local added ingredients for autocomplete (so newly created item is selectable immediately)
  const [localOptions, setLocalOptions] = useState([]);
  const mergedOptions = useMemo(
    () => [...(allIngredients || []), ...localOptions],
    [allIngredients, localOptions]
  );

  const [aliasMap, setAliasMap] = useState(() => loadAlias());
  useEffect(() => saveAlias(aliasMap), [aliasMap]);

  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingVisible, setMappingVisible] = useState(false);

  // dialog create ingredient
  const [createOpen, setCreateOpen] = useState(false);
  const [createRowIndex, setCreateRowIndex] = useState(null);
  const [newIngName, setNewIngName] = useState("");
  const [newIngNameEn, setNewIngNameEn] = useState("");

  // edit mode (click textfield => autocomplete)
  const [editingIndex, setEditingIndex] = useState(null);
  const startEdit = (index) => setEditingIndex(index);
  const stopEdit = () => setEditingIndex(null);

  // track signature of AI raw list to auto-run mapping only when raw names change
  const lastRawSigRef = useRef("");

  // raw list = only AI rows (manual rows not shown here to keep “nguồn gốc mapping” rõ ràng)
  const rawRows = useMemo(() => {
    return rows.filter((r) => r?.source !== "manual" && (r?.name || "").trim());
  }, [rows]);

  // mapped list = all rows (AI + manual additions)
  const mappedRows = rows;

  const summary = useMemo(() => {
    const totalRaw = rawRows.length;
    const totalMapped = mappedRows.length;
    const chosenDb = mappedRows.filter((r) => !!r.ingredientId).length;
    const missingGram = mappedRows.filter(
      (r) =>
        r?.quantity?.amount === "" ||
        r?.quantity?.amount === null ||
        r?.quantity?.amount === undefined ||
        Number(r?.quantity?.amount) <= 0
    ).length;
    return { totalRaw, totalMapped, chosenDb, missingGram };
  }, [rawRows, mappedRows]);

  const getSelectedOption = (row) => {
    if (!row?.ingredientId) return null;
    return mergedOptions.find((x) => x._id === row.ingredientId) || null;
  };

  const patchRow = (index, patch) => {
    const next = [...mappedRows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handlePickIngredient = (index, opt) => {
    const next = [...mappedRows];
    next[index] = {
      ...next[index],
      ingredientId: opt?._id || null,
      ingredientLabel: opt ? opt.name || opt.name_en || "" : "",
      // hiển thị mappingName theo DB sau khi chọn
      mappingName: opt
        ? opt.name || opt.name_en || next[index].mappingName || ""
        : next[index].mappingName,
    };
    onChange(next);
    stopEdit();

    // learning alias: raw AI name -> ingredientId
    const rawName = (next[index]?.name || "").trim();
    if (opt?._id && rawName) {
      const key = normalizeText(rawName);
      setAliasMap((p) => ({
        ...p,
        [key]: { ingredientId: opt._id, label: opt.name || opt.name_en || "" },
      }));
    }
  };

  const handleChangeGram = (index, value) => {
    patchRow(index, {
      quantity: {
        ...(mappedRows[index]?.quantity || {}),
        amount: value === "" ? "" : Number(value),
        unit: "g",
      },
    });
  };

  const handleRemoveRow = (index) => {
    const next = mappedRows.filter((_, i) => i !== index);
    onChange(next);
    if (editingIndex === index) stopEdit();
  };

  const handleAddRow = () => {
    const next = [
      ...mappedRows,
      {
        id: safeUUID(),
        source: "manual",
        name: "",
        rawText: "",
        quantity: { amount: "", unit: "g", estimate: false },

        ingredientId: null,
        ingredientLabel: "",
        mappingName: "",
        mappingSuggestion: null,
        mappingCandidates: [],
        mappingScore: null,
      },
    ];
    onChange(next);
    setEditingIndex(next.length - 1);
    setMappingVisible(true);
  };

  const openCreateDialog = (index) => {
    setCreateRowIndex(index);
    const prefill =
      mappedRows[index]?.mappingName ||
      mappedRows[index]?.ingredientLabel ||
      mappedRows[index]?.name ||
      "";
    setNewIngName(prefill);
    setNewIngNameEn("");
    setCreateOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setCreateRowIndex(null);
    setNewIngName("");
    setNewIngNameEn("");
  };

  const handleCreateIngredient = async () => {
    if (!onCreateIngredient) return;
    if (!newIngName.trim()) return;

    try {
      const created = await onCreateIngredient({
        name: newIngName.trim(),
        name_en: newIngNameEn.trim() || undefined,
      });

      if (created?._id) {
        setLocalOptions((p) => {
          if (p.some((x) => x._id === created._id)) return p;
          return [...p, created];
        });

        if (createRowIndex !== null) {
          handlePickIngredient(createRowIndex, created);
        }
      }
      closeCreateDialog();
    } catch (err) {
      console.error("Create ingredient error:", err);
    }
  };

  // ---- AUTO MAPPING FLOW ----
  const runAutoMapping = async () => {
    if (!rawRows.length) return;

    try {
      setMappingLoading(true);
      setMappingVisible(true);

      // map only AI rows, keep manual rows untouched
      const aiIndexes = [];
      const aiPayload = [];
      rawRows.forEach((r) => {
        const idx = mappedRows.findIndex((x) => x?.id === r?.id);
        if (idx >= 0) {
          aiIndexes.push(idx);
          aiPayload.push(mappedRows[idx]);
        }
      });

      const results = await fetchIngredientsNutrition(aiPayload, 3);
      const next = [...mappedRows];

      results.forEach((item, i) => {
        const targetIdx = aiIndexes[i];
        if (targetIdx === undefined) return;

        const candidates = item?.results || [];
        const top = candidates[0];

        const mappingName = top ? extractTopName(top) : "";
        const mappingScore = top ? extractScore(top) : null;

        // set grams from AI quantity if possible (g/kg)
        const q = next[targetIdx]?.quantity || {};
        const grams = toGram(q.amount, q.unit);

        next[targetIdx] = {
          ...next[targetIdx],
          mappingName,
          mappingCandidates: candidates,
          mappingScore,
          quantity: {
            amount: grams !== "" ? grams : q.unit === "g" ? q.amount : "",
            unit: "g",
            estimate: Boolean(q.estimate),
          },
        };

        // apply alias auto select if exists
        if (!next[targetIdx].ingredientId) {
          const key = normalizeText(next[targetIdx].name);
          const saved = aliasMap[key];
          if (saved?.ingredientId) {
            next[targetIdx].ingredientId = saved.ingredientId;
            next[targetIdx].ingredientLabel = saved.label || "";
            // show name in mappingName if mappingName empty
            if (!next[targetIdx].mappingName) next[targetIdx].mappingName = saved.label || "";
          }
        }
      });

      onChange(next);
      setEditingIndex(null);
    } catch (err) {
      console.error("Auto mapping error:", err);
    } finally {
      setMappingLoading(false);
    }
  };

  // auto trigger mapping when raw names signature changes
  useEffect(() => {
    const sig = rawRows.map((r) => normalizeText(r.name)).join("|");
    if (!sig) return;

    // Only when signature changes, and not during aiLoading
    if (sig !== lastRawSigRef.current && !aiLoading) {
      lastRawSigRef.current = sig;
      runAutoMapping();
    }
  }, [rawRows, aiLoading]);

  const handleRefreshMapping = async () => {
    const sig = rawRows.map((r) => normalizeText(r.name)).join("|");
    lastRawSigRef.current = sig || lastRawSigRef.current;
    await runAutoMapping();
  };

  return (
    <MDBox>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <div>
          <MDTypography variant="button" fontWeight="medium">
            Nguyên liệu & Mapping
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Bước 1: xem nguyên liệu thô (read-only) • Bước 2: mapping + chọn ingredient DB (gram chỉnh được)
          </MDTypography>
        </div>

        <MDBox display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Chip label={`Raw: ${summary.totalRaw}`} variant="outlined" />
          <Chip label={`Rows: ${summary.totalMapped}`} variant="outlined" />
          <Chip
            label={`Chọn DB: ${summary.chosenDb}`}
            color={summary.chosenDb ? "success" : "default"}
            variant="outlined"
          />
          <Chip
            label={`Thiếu gram: ${summary.missingGram}`}
            color={summary.missingGram ? "warning" : "default"}
            variant="outlined"
          />
        </MDBox>
      </MDBox>

      <Grid container spacing={2}>
        {/* RAW LIST (READ-ONLY) */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, p: 2, height: "100%" }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="top" mb={1.5}>
              <MDBox display="flex" flexDirection="column" gap={0.25}>
                <MDTypography variant="button" fontWeight="medium">
                  Nguyên liệu thô
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ maxWidth: "300px" }}>
                  Danh sách nguyên liệu được AI phân tích từ công thức bạn đã nhập.
                </MDTypography>
              </MDBox>

              <Tooltip
                title={
                  aiDisabled
                    ? "Nhập công thức/mô tả trước."
                    : "Phân tích nguyên liệu bằng AI và tự chạy mapping."
                }
              >
                <span>
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={onAnalyzeByAI}
                    disabled={aiLoading || aiDisabled}
                    startIcon={<AutoFixHighIcon />}
                  >
                    {aiLoading ? "Đang phân tích..." : "Phân tích AI"}
                  </MDButton>
                </span>
              </Tooltip>
            </MDBox>

            <Divider sx={{ mb: 2 }} />

            {aiLoading ? (
              <MDBox display="flex" flexDirection="column" gap={1}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={44} />
                ))}
              </MDBox>
            ) : rawRows.length === 0 ? (
              <MDTypography variant="caption" color="text">
                Chưa có dữ liệu nguyên liệu thô. Hãy bấm “Phân tích AI”.
              </MDTypography>
            ) : (
              <MDBox display="flex" flexDirection="column" gap={2}>
                {rawRows.map((r, i) => (
                  <Box
                    key={r.id || i}
                    sx={{
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 2,
                      p: 1.25,
                      bgcolor: "background.default",

                    }}
                  >
                    <MDBox display="flex" justifyContent="space-between" gap={1}>
                      <MDTypography variant="button" fontWeight="medium" sx={{ wordBreak: "break-word" }}>
                        {r.name}
                      </MDTypography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          r?.quantity?.amount !== "" && r?.quantity?.amount != null
                            ? `${r.quantity.amount} ${r.quantity.unit || ""}`
                            : "thiếu lượng"
                        }
                      />
                    </MDBox>
                  </Box>
                ))}
              </MDBox>
            )}
          </Card>
        </Grid>

        {/* MAPPING PANEL (RIGHT) */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, p: 2, height: "100%" }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDBox display="flex" flexDirection="column" gap={0.25}>
                <MDTypography variant="button" fontWeight="medium">
                  Nguyên liệu chuẩn hoá
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ maxWidth: "300px" }}>
                  Danh sách nguyên liệu đã được chuẩn hoá từ danh sách thô thành danh sách đã có trong hệ thống.
                </MDTypography>
              </MDBox>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                <Tooltip title="Chạy lại mapping">
                  <span>
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefreshMapping}
                      disabled={mappingLoading || rawRows.length === 0}
                    >
                      Refresh
                    </MDButton>
                  </span>
                </Tooltip>

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
            </MDBox>

            <Divider sx={{ mb: 1.5 }} />

            {mappingLoading ? (
              <MDBox display="flex" flexDirection="column" gap={1.25}>
                {Array.from({ length: Math.max(3, Math.min(6, mappedRows.length || 5)) }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={78} />
                ))}
              </MDBox>
            ) : mappingVisible || mappedRows.some((r) => r.mappingName) ? (
              mappedRows.length > 0 ? (
                mappedRows.map((row, index) => (
                  <Grid
                    container
                    spacing={1}
                    alignItems="top"
                    key={row.id || index}
                    sx={{ mb: 3 }}
                  >
                    {/* NAME: read-only -> click => autocomplete */}
                    <Grid item xs={12} md={7}>
                      {editingIndex === index ? (
                        <Autocomplete
                          options={mergedOptions}
                          getOptionLabel={(opt) => opt?.name || opt?.name_en || ""}
                          value={getSelectedOption(row)}
                          onChange={(_, opt) => handlePickIngredient(index, opt)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              size="small"
                              label="Chọn nguyên liệu trong DB"
                              placeholder="Gõ để tìm..."
                              autoFocus
                            />
                          )}
                          freeSolo={false}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          label="Tên nguyên liệu mapping"
                          value={row.mappingName || row.ingredientLabel || ""}
                          InputProps={{ readOnly: true }}
                          placeholder="Chưa có gợi ý mapping"
                          onClick={() => startEdit(index)}
                          sx={{
                            cursor: "pointer",
                            "& .MuiInputBase-root": { cursor: "pointer" },
                          }}
                        />
                      )}

                      {/* row actions under name */}
                      <MDBox mt={0.75} display="flex" gap={1} flexWrap="wrap">
                        {/* <Chip
                          size="small"
                          variant="outlined"
                          color={row.ingredientId ? "success" : "error"}
                          label={row.ingredientId ? "Đã chọn DB" : "Chưa chọn DB"}
                        /> */}
                        {typeof row.mappingScore === "number" ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Score: ${Math.round(row.mappingScore * 100)}%`}
                          />
                        ) : null}
                        {onCreateIngredient ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => openCreateDialog(index)}
                            label="Tạo ingredient mới"
                          />
                        ) : null}
                      </MDBox>
                    </Grid>

                    {/* GRAM */}
                    <Grid item xs={10} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Khối lượng (g)"
                        value={row.quantity?.amount ?? ""}
                        onChange={(e) => handleChangeGram(index, e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">g</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* DELETE */}
                    <Grid item xs={2} md={1} mt={0.6} display="flex" justifyContent="flex-end" alignItems="flex-start">
                      <Tooltip title="Xóa dòng">
                        <IconButton size="small" color="error" onClick={() => handleRemoveRow(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <MDTypography variant="caption" color="text">
                  Chưa có nguyên liệu nào để mapping.
                </MDTypography>
              )
            ) : (
              <MDTypography variant="caption" color="text">
                Chưa mapping. Hãy bấm “Phân tích AI” để tự động mapping.
              </MDTypography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Create ingredient dialog */}
      <Dialog open={createOpen} onClose={closeCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm nguyên liệu mới</DialogTitle>
        <DialogContent dividers>
          <MDTypography variant="caption" color="text">
            Tạo ingredient mới trong DB và tự chọn cho dòng hiện tại.
          </MDTypography>

          <MDBox mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Tên (VI) *"
              value={newIngName}
              onChange={(e) => setNewIngName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Tên (EN)"
              value={newIngNameEn}
              onChange={(e) => setNewIngNameEn(e.target.value)}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" color="secondary" onClick={closeCreateDialog}>
            Hủy
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            onClick={handleCreateIngredient}
            disabled={!newIngName.trim() || !onCreateIngredient}
          >
            Tạo
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

RecipeIngredientsEditor.propTypes = {
  ingredients: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  allIngredients: PropTypes.array.isRequired,
  onAnalyzeByAI: PropTypes.func,
  aiLoading: PropTypes.bool,
  aiDisabled: PropTypes.bool,
  onCreateIngredient: PropTypes.func, // async ({name,name_en}) => created ingredient
};

RecipeIngredientsEditor.defaultProps = {
  onAnalyzeByAI: undefined,
  aiLoading: false,
  aiDisabled: false,
  onCreateIngredient: undefined,
};
