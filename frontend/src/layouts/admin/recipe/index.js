// src/layouts/admin/recipes/index.jsx
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import RecipeFilters from "./components/RecipeFilters";
import RecipeTable from "./components/RecipeTable";
import RecipeFormDialog from "./components/RecipeFormDialog";
import RecipeStatsCards from "./components/RecipeStatsCards";
import DeleteConfirmDialog from "components/shared/DeleteConfirmDialog";

import {
  getRecipes,
  getRecipeStats,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  checkDuplicateName,
} from "services/recipeApi";
import { getIngredients } from "services/ingredientApi";

import { useToast } from "context/ToastContext";
import { handleError } from "utils/errorHandler";

function toUiIngredientRow(input) {
  const id =
    (typeof crypto !== "undefined" && crypto?.randomUUID?.()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    name: input?.name || "",
    rawText: input?.rawText || input?.name || "",
    quantity: {
      amount: input?.quantity?.amount ?? "",
      unit: input?.quantity?.unit || "g",
      estimate: Boolean(input?.quantity?.estimate),
    },
    grams: input?.grams ?? "",
    ingredientId: input?.ingredientId ?? null,
    ingredientLabel: input?.ingredientLabel || "",
    mappingName: input?.mappingName || "",
    mappingSuggestion: input?.mappingSuggestion ?? null,
    mapping: input?.mapping ?? { suggestions: [] },
    flags: input?.flags ?? { optional: false },
  };
}

function RecipeManagement() {
  const { showSuccess, showError } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filters và pagination
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [allIngredients, setAllIngredients] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getRecipes({
        search,
        category: categoryFilter,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (result.data && result.pagination) {
        setRecipes(result.data);
        setPagination(result.pagination);
      } else {
        setRecipes([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      const errorMessage = handleError(err);
      showError(errorMessage);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await getRecipeStats();
      setStats(statsData);
    } catch (err) {
      console.error("Fetch stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      // Lấy tất cả nguyên liệu bằng cách fetch nhiều trang nếu cần
      let allIngredientsList = [];
      let currentPage = 1;
      const pageSize = 1000; // Lấy 1000 mỗi lần để tránh quá tải
      let hasMore = true;

      while (hasMore) {
        const result = await getIngredients({
          limit: pageSize,
          page: currentPage,
          sortBy: "name",
          sortOrder: "asc",
        });

        if (result.data && Array.isArray(result.data)) {
          allIngredientsList = [...allIngredientsList, ...result.data];

          // Kiểm tra xem còn trang nào không
          if (result.pagination) {
            hasMore = currentPage < result.pagination.totalPages;
            currentPage++;
          } else {
            // Nếu không có pagination info, dừng lại nếu số lượng < pageSize
            hasMore = result.data.length === pageSize;
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      }

      setAllIngredients(allIngredientsList);
      console.log(`Đã tải ${allIngredientsList.length} nguyên liệu cho mapping`);
    } catch (err) {
      console.error("Fetch ingredients for mapping error:", err);
      // Fallback: thử lấy với limit nhỏ hơn nếu lỗi
      try {
        const fallbackResult = await getIngredients({ limit: 100 });
        if (fallbackResult.data) {
          setAllIngredients(fallbackResult.data);
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch ingredients error:", fallbackErr);
        setAllIngredients([]);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchAllIngredients();
  }, []);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, sortBy, sortOrder]);

  const handleAddClick = () => {
    setEditingRecipe(null);
    setDialogOpen(true);
  };

  const handleEditClick = (recipe) => {
    const instructionsText = Array.isArray(recipe.instructions)
      ? recipe.instructions.join("\n")
      : recipe.instructions || "";

    const uiIngredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(toUiIngredientRow)
      : [];

    setEditingRecipe({
      ...recipe,
      instructionsText,
      ingredients: uiIngredients,
      imageUrl: recipe.imageUrl || recipe.image || "",
    });

    setDialogOpen(true);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      setDeleting(true);
      await deleteRecipe(recipeToDelete._id);
      showSuccess(`Đã xóa món ăn "${recipeToDelete.name}"`);
      await fetchData();
      await fetchStats();
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      const errorMessage = handleError(err);
      showError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRecipe(null);
  };

  const handleDialogSubmit = async (formData) => {
    try {
      // Validation
      if (!formData.name?.trim()) {
        showError("Tên món ăn là bắt buộc");
        return;
      }

      // Check duplicate
      const isDuplicate = await checkDuplicateName(formData.name.trim(), editingRecipe?._id);

      if (isDuplicate) {
        showError(`Món ăn "${formData.name}" đã tồn tại`);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        servings: formData.servings,
        imageUrl: formData.imageUrl || undefined,
        status: formData.status || undefined,

        instructions: formData.instructionsText
          ? formData.instructionsText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],

        ingredients: (formData.ingredients || [])
          .filter((row) => {
            // Filter bỏ các nguyên liệu không hợp lệ (thiếu name hoặc quantity.amount)
            const hasName = row.name && row.name.trim();
            const hasAmount =
              row.quantity?.amount !== "" &&
              row.quantity?.amount !== null &&
              row.quantity?.amount !== undefined &&
              Number(row.quantity?.amount) > 0;
            return hasName && hasAmount;
          })
          .map((row) => ({
            name: row.name || row.ingredientLabel || row.mappingName || "",
            ingredientId: row.ingredientId,
            quantity: {
              amount: Number(row.quantity?.amount) || 0,
              unit: row.quantity?.unit || "g",
            },
            grams:
              row.grams === "" || row.grams === null || row.grams === undefined
                ? undefined
                : Number(row.grams),
            isOptional: Boolean(row?.flags?.optional),
            rawText: row.rawText || undefined,
          })),
      };

      if (editingRecipe && editingRecipe._id) {
        await updateRecipe(editingRecipe._id, payload);
        showSuccess("Cập nhật món ăn thành công");
      } else {
        await createRecipe(payload);
        showSuccess("Thêm món ăn thành công");
      }

      await fetchData();
      await fetchStats();
      handleDialogClose();
    } catch (err) {
      const errorMessage = handleError(err);
      showError(errorMessage);
    }
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <MDTypography variant="h5" fontWeight="medium">
              Quản lý món ăn
            </MDTypography>
            <MDTypography variant="button" color="text">
              Tạo, chỉnh sửa công thức và quản lý nguyên liệu / dinh dưỡng
            </MDTypography>
          </div>

          <Tooltip title="Thêm món ăn mới">
            <IconButton
              color="primary"
              onClick={handleAddClick}
              sx={{ borderRadius: "12px", boxShadow: 2 }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </MDBox>

        {/* Statistics Cards */}
        <RecipeStatsCards stats={stats} loading={statsLoading} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <RecipeFilters
                search={search}
                onSearchChange={setSearch}
                category={categoryFilter}
                onCategoryChange={setCategoryFilter}
              />

              <RecipeTable
                loading={loading}
                recipes={recipes}
                pagination={pagination}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onPageChange={handlePageChange}
              />
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <RecipeFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        recipe={editingRecipe}
        allIngredients={allIngredients}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRecipeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa món ăn"
        itemName={recipeToDelete?.name}
        loading={deleting}
      />
    </DashboardLayout>
  );
}

export default RecipeManagement;
