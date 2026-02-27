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
  Alert,
  LinearProgress,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";

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
  const s = top?.score ?? top?.similarity ?? top?.cosine ?? top?.confidence ?? null;
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
  const hasRunMappingRef = useRef(false);

  // raw list = only AI rows (manual rows not shown here to keep "nguồn gốc mapping" rõ ràng)
  const rawRows = useMemo(() => {
    return rows.filter((r) => r?.source !== "manual" && (r?.name || "").trim());
  }, [rows]);

  // mapped list = all rows (AI + manual additions)
  const mappedRows = rows;

  // Get mapped rows that correspond to raw rows (for alignment)
  const mappedRowsForRaw = useMemo(() => {
    return rawRows.map((rawRow) => {
      return mappedRows.find((mr) => mr.id === rawRow.id) || rawRow;
    });
  }, [rawRows, mappedRows]);

  // Manual rows (added manually, not from AI)
  const manualRows = useMemo(() => {
    return mappedRows.filter((r) => r?.source === "manual");
  }, [mappedRows]);

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
    const ingredientName = opt ? opt.name || opt.name_en || "" : "";

    next[index] = {
      ...next[index],
      ingredientId: opt?._id || opt?.id || null,
      ingredientLabel: ingredientName,
      // hiển thị mappingName theo DB sau khi chọn
      mappingName: opt ? ingredientName || next[index].mappingName || "" : next[index].mappingName,
      // ✅ Tự động set name từ ingredientLabel nếu name đang rỗng (cho manual ingredients)
      // Giữ nguyên name hiện tại nếu đã có, chỉ set nếu rỗng
      name:
        next[index].name && next[index].name.trim()
          ? next[index].name
          : ingredientName || next[index].name || "",
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
    if (!rawRows.length) {
      console.log("❌ runAutoMapping: No rawRows, returning early");
      return;
    }

    try {
      console.log("runAutoMapping: Starting...");
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

        // Auto-select ingredientId from mongo_id if exact match or high score
        let autoIngredientId = null;
        let autoIngredientLabel = "";
        if (top && (top.exact_alias_match || (mappingScore && mappingScore >= 0.9))) {
          // Use mongo_id if available, fallback to id
          autoIngredientId = top.mongo_id || top.id || null;
          autoIngredientLabel = top.name_vi || top.name || "";
        }

        // ✅ Chỉ update mapping fields nếu chưa có ingredientId (chưa được user chọn)
        // Nếu user đã chọn rồi (có ingredientId), giữ nguyên data đã chỉnh sửa
        const hasUserSelection = !!next[targetIdx].ingredientId;

        next[targetIdx] = {
          ...next[targetIdx],
          // ✅ Chỉ update mapping fields nếu chưa có user selection
          mappingName: hasUserSelection ? next[targetIdx].mappingName : mappingName,
          mappingCandidates: hasUserSelection ? next[targetIdx].mappingCandidates : candidates,
          mappingScore: hasUserSelection ? next[targetIdx].mappingScore : mappingScore,
          // Auto-set ingredientId if exact match or high score (chỉ khi chưa có)
          ingredientId: hasUserSelection
            ? next[targetIdx].ingredientId
            : autoIngredientId || next[targetIdx].ingredientId || null,
          ingredientLabel: hasUserSelection
            ? next[targetIdx].ingredientLabel
            : autoIngredientLabel || next[targetIdx].ingredientLabel || "",
          // ✅ Chỉ update quantity nếu chưa có user selection
          quantity:
            hasUserSelection && next[targetIdx].quantity?.amount
              ? next[targetIdx].quantity
              : {
                  amount: grams !== "" ? grams : q.unit === "g" ? q.amount : "",
                  unit: "g",
                  estimate: Boolean(q.estimate),
                },
        };

        // apply alias auto select if exists (only if not already set from mapping)
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
    if (!sig) {
      // Reset refs when no raw rows
      lastRawSigRef.current = "";
      hasRunMappingRef.current = false;
      return;
    }

    // ✅ Kiểm tra xem đã có mapping data chưa (tránh chạy lại khi remount)
    const hasMappingData = mappedRows.some(
      (r) => r.mappingName || r.mappingCandidates?.length > 0 || r.mappingScore !== null
    );

    // ✅ Chỉ chạy mapping khi:
    // 1. Signature thay đổi (rawRows từ AI mới) và không đang loading
    // 2. Chưa có mapping data (lần đầu) và không đang loading
    // 3. KHÔNG chạy lại khi remount với cùng signature và đã có mapping data
    if (sig !== lastRawSigRef.current && !aiLoading) {
      // Signature thay đổi: chỉ chạy khi thực sự có thay đổi từ AI
      lastRawSigRef.current = sig;
      hasRunMappingRef.current = true;
      runAutoMapping();
    } else if (
      sig === lastRawSigRef.current &&
      !hasMappingData &&
      !hasRunMappingRef.current &&
      !aiLoading
    ) {
      // Lần đầu mount với signature này và chưa có mapping data: chạy mapping một lần
      hasRunMappingRef.current = true;
      runAutoMapping();
    } else if (sig === lastRawSigRef.current) {
      // Signature giống: cập nhật ref để giữ sync, nhưng không chạy mapping lại
      // (tránh overwrite data đã chỉnh sửa khi remount)
      if (!hasRunMappingRef.current && hasMappingData) {
        hasRunMappingRef.current = true; // Đánh dấu đã có mapping data
      }
    }
  }, [rawRows, aiLoading, mappedRows]);

  const progressPercent =
    summary.totalMapped > 0 ? Math.round((summary.chosenDb / summary.totalMapped) * 100) : 0;

  return (
    <MDBox>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <div>
          <MDTypography variant="button" fontWeight="medium">
            Nguyên liệu và khối lượng
          </MDTypography>
        </div>

        <MDBox display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Chip
            label={`Tổng: ${summary.totalMapped}`}
            variant="outlined"
            color={summary.totalMapped > 0 ? "info" : "default"}
          />
          <Chip
            label={`Thiếu khối lượng: ${summary.missingGram}`}
            color={summary.missingGram === 0 ? "success" : "warning"}
            variant="outlined"
          />
        </MDBox>
      </MDBox>

      <Grid container spacing={2} alignItems="flex-start">
        {/* RAW LIST (READ-ONLY) */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ borderRadius: 2, p: 2, height: "100%", display: "flex", flexDirection: "column" }}
          >
            <MDBox display="flex" justifyContent="space-between" alignItems="top" mb={1}>
              <MDBox display="flex" flexDirection="column" gap={0.25}>
                <MDTypography variant="button" fontWeight="medium">
                  Nguyên liệu thô
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ maxWidth: "300px" }}>
                  Danh sách nguyên liệu được AI phân tích từ công thức bạn đã nhập.
                </MDTypography>
              </MDBox>
            </MDBox>

            <Divider sx={{ mb: 1.5 }} />

            {aiLoading ? (
              <MDBox display="flex" flexDirection="column" gap={1}>
                <LinearProgress />
                <MDTypography variant="caption" color="text" sx={{ mt: 1, textAlign: "center" }}>
                  Đang phân tích nguyên liệu...
                </MDTypography>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
                ))}
              </MDBox>
            ) : rawRows.length === 0 ? (
              <Alert severity="info">
                <MDTypography variant="caption">
                  Chưa có dữ liệu nguyên liệu thô. Hãy quay lại bước trước và bấm &quot;Phân tích
                  nguyên liệu (AI)&quot;.
                </MDTypography>
              </Alert>
            ) : (
              <MDBox display="flex" flexDirection="column" gap={2} flex={1}>
                {rawRows.map((r, i) => {
                  const mappedRow = mappedRows.find((mr) => mr.id === r.id);
                  const isMapped = !!mappedRow?.ingredientId;
                  return (
                    <Paper
                      key={r.id || i}
                      elevation={isMapped ? 0 : 1}
                      sx={{
                        border: "1px solid",
                        borderColor: isMapped ? "success.main" : "grey.300",
                        borderRadius: 2,
                        p: 1.5,
                        mb: 0,
                        bgcolor: isMapped ? "success.lighter" : "background.default",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <MDBox flex={1}>
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            sx={{ wordBreak: "break-word" }}
                          >
                            {r.name}
                          </MDTypography>
                        </MDBox>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            r?.quantity?.amount !== "" && r?.quantity?.amount != null
                              ? "success"
                              : "warning"
                          }
                          label={
                            r?.quantity?.amount !== "" && r?.quantity?.amount != null
                              ? `${r.quantity.amount} ${r.quantity.unit || ""}`
                              : "thiếu lượng"
                          }
                        />
                      </MDBox>
                    </Paper>
                  );
                })}
              </MDBox>
            )}
          </Card>
        </Grid>

        {/* MAPPING PANEL (RIGHT) */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ borderRadius: 2, p: 2, height: "100%", display: "flex", flexDirection: "column" }}
          >
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDBox display="flex" flexDirection="column" gap={0.25}>
                <MDTypography variant="button" fontWeight="medium">
                  Nguyên liệu chuẩn hoá
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ maxWidth: "300px" }}>
                  Danh sách nguyên liệu sẽ được sử dụng để tính toán dinh dưỡng cho món ăn này.
                </MDTypography>
              </MDBox>
              <MDBox display="flex" gap={1} flexWrap="wrap">
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
                <LinearProgress />
                <MDTypography variant="caption" color="text" sx={{ textAlign: "center" }}>
                  Đang mapping nguyên liệu...
                </MDTypography>
                {Array.from({ length: Math.max(3, Math.min(6, mappedRows.length || 5)) }).map(
                  (_, i) => (
                    <Skeleton key={i} variant="rectangular" height={78} sx={{ borderRadius: 1 }} />
                  )
                )}
              </MDBox>
            ) : mappingVisible || mappedRows.some((r) => r.mappingName) ? (
              mappedRowsForRaw.length > 0 ? (
                <MDBox flex={1}>
                  {/* Mapped rows corresponding to raw rows */}
                  {mappedRowsForRaw.map((row, rawIndex) => {
                    // Find the actual index in mappedRows array
                    const actualIndex = mappedRows.findIndex((mr) => mr.id === row.id);
                    if (actualIndex < 0) return null;

                    const isMapped = !!row.ingredientId;
                    const rawRow = rawRows[rawIndex];

                    return (
                      <Paper
                        key={row.id || rawIndex}
                        elevation={isMapped ? 0 : 1}
                        sx={{
                          p: 1.5,
                          pb: 0.75,
                          mb: 1,
                          border: "1px solid",
                          borderColor: isMapped ? "success.main" : "grey.300",
                          bgcolor: isMapped ? "success.lighter" : "background.paper",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative", // For absolute positioned close button
                        }}
                      >
                        {/* Close button - float ở góc trên bên phải */}
                        <Tooltip title="Xóa nguyên liệu này">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveRow(actualIndex)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              zIndex: 1,
                              bgcolor: "background.paper",
                              "&:hover": { bgcolor: "error.lighter" },
                              boxShadow: 1,
                              width: 24,
                              height: 24,
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Grid container spacing={1} alignItems="flex-start">
                          {/* NAME: read-only -> click => autocomplete */}
                          <Grid item xs={12} md={6}>
                            {editingIndex === actualIndex ? (
                              <Autocomplete
                                options={mergedOptions}
                                getOptionLabel={(opt) => opt?.name || opt?.name_en || ""}
                                value={getSelectedOption(row)}
                                onChange={(_, opt) => handlePickIngredient(actualIndex, opt)}
                                onBlur={stopEdit}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    size="small"
                                    label="Chọn nguyên liệu trong DB"
                                    placeholder="Gõ để tìm..."
                                    autoFocus
                                    helperText="Chọn nguyên liệu từ danh sách hoặc tạo mới"
                                  />
                                )}
                                freeSolo={false}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                label="Tên nguyên liệu mapping"
                                value={row.mappingName || row.ingredientLabel || row.name || ""}
                                InputProps={{ readOnly: true }}
                                placeholder="Chưa có gợi ý mapping - Click để chọn"
                                onClick={() => startEdit(actualIndex)}
                                sx={{
                                  cursor: "pointer",
                                  "& .MuiInputBase-root": { cursor: "pointer" },
                                }}
                              />
                            )}

                            {/* row actions under name */}
                            <MDBox
                              mt={0.75}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              gap={0.5}
                              flexWrap="wrap"
                            >
                              {onCreateIngredient ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  clickable
                                  onClick={() => openCreateDialog(actualIndex)}
                                  label="+ Tạo mới"
                                  color="info"
                                  sx={{ height: 20, fontSize: "0.65rem" }}
                                />
                              ) : null}
                              {/* Score text - góc dưới bên trái */}
                              {(isMapped || typeof row.mappingScore === "number") &&
                                (() => {
                                  let scorePercent;
                                  if (isMapped) {
                                    scorePercent = 100;
                                  } else if (typeof row.mappingScore === "number") {
                                    scorePercent = Math.round(row.mappingScore * 100);
                                  } else {
                                    return null;
                                  }
                                  const isGreen = scorePercent === 100;
                                  return (
                                    <MDTypography
                                      variant="caption"
                                      color={isGreen ? "success" : "warning"}
                                      sx={{ fontSize: "0.7rem", height: 1 }}
                                    >
                                      Tỉ lệ đúng: {scorePercent}%
                                    </MDTypography>
                                  );
                                })()}
                            </MDBox>
                          </Grid>

                          {/* GRAM */}
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Khối lượng (g)"
                              value={row.quantity?.amount ?? ""}
                              onChange={(e) => handleChangeGram(actualIndex, e.target.value)}
                              error={!row.quantity?.amount || Number(row.quantity?.amount) <= 0}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment
                                    position="end"
                                    sx={{
                                      fontSize: "0.25rem",
                                      fontWeight: 100,
                                      color: "text.secondary",
                                    }}
                                  >
                                    g
                                  </InputAdornment>
                                ),
                              }}
                              inputProps={{ min: 0, step: 0.1 }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}

                  {/* Manual rows (added manually, shown separately) */}
                  {manualRows.length > 0 && (
                    <MDBox mt={3}>
                      <Divider sx={{ mb: 2 }} />

                      {manualRows.map((row, idx) => {
                        const actualIndex = mappedRows.findIndex((mr) => mr.id === row.id);
                        if (actualIndex < 0) return null;

                        const isMapped = !!row.ingredientId;
                        return (
                          <Paper
                            key={row.id || `manual-${idx}`}
                            elevation={isMapped ? 0 : 1}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              border: "1px solid",
                              borderColor: isMapped ? "success.main" : "grey.300",
                              bgcolor: isMapped ? "success.lighter" : "background.paper",
                              borderRadius: 1.5,
                              transition: "all 0.2s",
                              position: "relative", // For absolute positioned close button
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* Close button - float ở góc trên bên phải */}
                            <Tooltip title="Xóa nguyên liệu này">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveRow(actualIndex)}
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                  bgcolor: "background.paper",
                                  "&:hover": { bgcolor: "error.lighter" },
                                  boxShadow: 1,
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Grid container spacing={1.5} alignItems="flex-start">
                              <Grid item xs={12} md={6}>
                                {editingIndex === actualIndex ? (
                                  <Autocomplete
                                    options={mergedOptions}
                                    getOptionLabel={(opt) => opt?.name || opt?.name_en || ""}
                                    value={getSelectedOption(row)}
                                    onChange={(_, opt) => handlePickIngredient(actualIndex, opt)}
                                    onBlur={stopEdit}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        label="Chọn nguyên liệu trong DB"
                                        placeholder="Gõ để tìm..."
                                        autoFocus
                                        helperText="Chọn nguyên liệu từ danh sách hoặc tạo mới"
                                      />
                                    )}
                                    freeSolo={false}
                                  />
                                ) : (
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Tên nguyên liệu mapping"
                                    value={row.mappingName || row.ingredientLabel || row.name || ""}
                                    InputProps={{ readOnly: true }}
                                    placeholder="Chưa có gợi ý mapping - Click để chọn"
                                    onClick={() => startEdit(actualIndex)}
                                    sx={{
                                      cursor: "pointer",
                                      "& .MuiInputBase-root": { cursor: "pointer" },
                                    }}
                                  />
                                )}

                                <MDBox
                                  mt={0.5}
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  gap={0.5}
                                  flexWrap="wrap"
                                >
                                  {onCreateIngredient ? (
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      clickable
                                      onClick={() => openCreateDialog(actualIndex)}
                                      label="+ Tạo mới"
                                      color="info"
                                      sx={{ height: 20, fontSize: "0.65rem" }}
                                    />
                                  ) : null}
                                  {/* Score text - góc dưới bên trái */}
                                  {(isMapped || typeof row.mappingScore === "number") &&
                                    (() => {
                                      let scorePercent;
                                      if (isMapped) {
                                        scorePercent = 100;
                                      } else if (typeof row.mappingScore === "number") {
                                        scorePercent = Math.round(row.mappingScore * 100);
                                      } else {
                                        return null;
                                      }
                                      const isGreen = scorePercent === 100;
                                      return (
                                        <MDTypography
                                          variant="caption"
                                          color={isGreen ? "success" : "warning"}
                                          sx={{ fontSize: "0.7rem" }}
                                        >
                                          Tỉ lệ đúng: {scorePercent}%
                                        </MDTypography>
                                      );
                                    })()}
                                </MDBox>
                              </Grid>

                              {/* GRAM */}
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  label="Khối lượng (g)"
                                  value={row.quantity?.amount ?? ""}
                                  onChange={(e) => handleChangeGram(actualIndex, e.target.value)}
                                  error={!row.quantity?.amount || Number(row.quantity?.amount) <= 0}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                                  }}
                                  inputProps={{ min: 0, step: 0.1 }}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        );
                      })}
                    </MDBox>
                  )}
                </MDBox>
              ) : (
                <Alert severity="info">
                  <MDTypography variant="caption">
                    Chưa có nguyên liệu nào để mapping. Hãy quay lại bước trước và phân tích nguyên
                    liệu bằng AI.
                  </MDTypography>
                </Alert>
              )
            ) : (
              <Alert severity="warning">
                <MDTypography variant="caption">
                  Chưa mapping. Hãy quay lại bước trước và bấm &quot;Phân tích nguyên liệu
                  (AI)&quot; để tự động mapping.
                </MDTypography>
              </Alert>
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
