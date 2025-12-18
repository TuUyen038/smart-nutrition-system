// src/layouts/admin/ingredients/index.jsx
import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import IngredientFilters from "./components/IngredientFilters";
import IngredientTable from "./components/IngredientTable";
import IngredientFormDialog from "./components/IngredientFormDialog";

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "services/ingredientApi";

// Hàm chuẩn hóa dữ liệu nguyên liệu cho form (đảm bảo luôn có nutrition đầy đủ field)
const normalizeIngredientForForm = (ingredient) => {
  if (!ingredient) return null;

  return {
    ...ingredient,
    name: ingredient.name || "",
    name_en: ingredient.name_en || "",
    unit: ingredient.unit || "g",
    category: ingredient.category || "other",
    source: ingredient.source || "",
    nutrition: {
      calories: ingredient.nutrition?.calories ?? "",
      protein: ingredient.nutrition?.protein ?? "",
      fat: ingredient.nutrition?.fat ?? "",
      carbs: ingredient.nutrition?.carbs ?? "",
      fiber: ingredient.nutrition?.fiber ?? "",
      sugar: ingredient.nutrition?.sugar ?? "",
      sodium: ingredient.nutrition?.sodium ?? "",
    },
  };
};

function IngredientManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const filteredIngredients = useMemo(() => {
    let data = [...ingredients];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) => item.name?.toLowerCase().includes(q) || item.name_en?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    return data;
  }, [ingredients, search, categoryFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data || []);
    } catch (err) {
      console.error("Fetch ingredients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thêm mới: không truyền ingredient -> dialog tự dùng form rỗng
  const handleAddClick = () => {
    setEditingIngredient(null);
    setDialogOpen(true);
  };

  // Chỉnh sửa: chuẩn hóa trước khi truyền xuống dialog
  const handleEditClick = (ingredient) => {
    const normalized = normalizeIngredientForForm(ingredient);
    setEditingIngredient(normalized);
    setDialogOpen(true);
  };

  const handleDeleteClick = async (ingredient) => {
    if (!window.confirm(`Xóa nguyên liệu "${ingredient.name}"?`)) return;
    try {
      await deleteIngredient(ingredient._id);
      await fetchData();
    } catch (err) {
      console.error("Delete ingredient error:", err);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingIngredient(null);
  };

  const handleDialogSubmit = async (formData) => {
    try {
      if (editingIngredient && editingIngredient._id) {
        await updateIngredient(editingIngredient._id, formData);
      } else {
        await createIngredient(formData);
      }
      await fetchData();
      handleDialogClose();
    } catch (err) {
      console.error("Save ingredient error:", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header + nút thêm */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <MDTypography variant="h5" fontWeight="medium">
              Quản lý nguyên liệu
            </MDTypography>
            <MDTypography variant="button" color="text">
              Theo dõi và cập nhật dữ liệu dinh dưỡng cho từng nguyên liệu
            </MDTypography>
          </div>

          <Tooltip title="Thêm nguyên liệu mới">
            <IconButton
              color="primary"
              onClick={handleAddClick}
              sx={{
                borderRadius: "12px",
                boxShadow: 2,
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </MDBox>

        {/* Filter + bảng */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <IngredientFilters
                search={search}
                onSearchChange={setSearch}
                category={categoryFilter}
                onCategoryChange={setCategoryFilter}
              />

              <Grid item xs={12} sx={{ textAlign: "right", mb: 1 }}>
                <MDTypography variant="caption" color="text">
                  * Dữ liệu dinh dưỡng được tính theo đơn vị 100g
                </MDTypography>
              </Grid>
              
              <IngredientTable
                loading={loading}
                ingredients={filteredIngredients}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <IngredientFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        ingredient={editingIngredient}
      />
    </DashboardLayout>
  );
}

export default IngredientManagement;
