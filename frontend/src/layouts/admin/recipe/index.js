// src/layouts/admin/recipes/index.jsx
import { useEffect, useMemo, useState } from "react";
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

import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "services/recipeApi";
import { getIngredients } from "services/ingredientApi";

function toUiIngredientRow(input) {
  // input backend: { name, ingredientId, quantity:{amount,unit}, ... }
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
    ingredientLabel: input?.ingredientLabel ?? "",
    mappingName: input?.mappingName ?? "",
    mappingSuggestion: input?.mappingSuggestion ?? null,
    mapping: input?.mapping ?? { suggestions: [] },
    flags: input?.flags ?? { optional: false },
  };
}

function RecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const [allIngredients, setAllIngredients] = useState([]);

  const filteredRecipes = useMemo(() => {
    let data = [...recipes];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((item) => item.name?.toLowerCase().includes(q));
    }

    if (categoryFilter !== "all") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    return data;
  }, [recipes, search, categoryFilter]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data || []);
    } catch (err) {
      console.error("Fetch recipes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      const data = await getIngredients();
      setAllIngredients(data || []);
    } catch (err) {
      console.error("Fetch ingredients for mapping error:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchAllIngredients();
  }, []);

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
      // nếu backend có ảnh thì giữ lại:
      imageUrl: recipe.imageUrl || recipe.image || "",
    });

    setDialogOpen(true);
  };

  const handleDeleteClick = async (recipe) => {
    if (!window.confirm(`Xóa món ăn "${recipe.name}"?`)) return;
    try {
      await deleteRecipe(recipe._id);
      await fetchRecipes();
    } catch (err) {
      console.error("Delete recipe error:", err);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRecipe(null);
  };

  const handleDialogSubmit = async (formData) => {
    // formData có thêm status: 'draft' | 'published'
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

      // backend bạn đang nhận { name, ingredientId, quantity }
      // thêm optional fields nếu backend ignore thì ok
      ingredients: (formData.ingredients || []).map((row) => ({
        name: row.name,
        ingredientId: row.ingredientId,
        quantity: row.quantity,
        grams:
          row.grams === "" || row.grams === null || row.grams === undefined
            ? undefined
            : Number(row.grams),
        isOptional: Boolean(row?.flags?.optional),
        rawText: row.rawText || undefined,
      })),
    };

    try {
      if (editingRecipe && editingRecipe._id) {
        await updateRecipe(editingRecipe._id, payload);
      } else {
        await createRecipe(payload);
      }
      await fetchRecipes();
      handleDialogClose();
    } catch (err) {
      console.error("Save recipe error:", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
                recipes={filteredRecipes}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
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
    </DashboardLayout>
  );
}

export default RecipeManagement;
