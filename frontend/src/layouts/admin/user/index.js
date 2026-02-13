// src/layouts/admin/user/index.jsx
import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserFormDialog from "./components/UserFormDialog";

import { getUsers, updateUser, softDeleteUser } from "services/userApi";
import DeleteUserDialog from "./components/DeleteDialog";
import { handleError } from "utils/errorHandler";
import { useToast } from "context/ToastContext";

function UserManagement() {
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) => item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q)
      );
    }

    if (genderFilter !== "all") {
      data = data.filter((item) => item.gender === genderFilter);
    }

    if (goalFilter !== "all") {
      data = data.filter((item) => item.goal === goalFilter);
    }

    return data;
  }, [users, search, genderFilter, goalFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (reason) => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await softDeleteUser(userToDelete._id, reason);
      showSuccess(`Đã xóa người dùng "${userToDelete.name}"`);
      await fetchData();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      const errorMessage = handleError(err);
      showError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleDialogSubmit = async (formData) => {
    try {
      if (editingUser && editingUser._id) {
        await updateUser(editingUser._id, formData);
      }
      await fetchData();
      handleDialogClose();
    } catch (err) {
      console.error("Save user error:", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <MDTypography variant="h5" fontWeight="medium">
              Quản lý người dùng
            </MDTypography>
            <MDTypography variant="button" color="text">
              Xem và quản lý thông tin người dùng trong hệ thống
            </MDTypography>
          </div>
        </MDBox>

        {/* Filter + bảng */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <UserFilters
                search={search}
                onSearchChange={setSearch}
                gender={genderFilter}
                onGenderChange={setGenderFilter}
                goal={goalFilter}
                onGoalChange={setGoalFilter}
              />

              <UserTable
                loading={loading}
                users={filteredUsers}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <UserFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        user={editingUser}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa người dùng"
        itemName={userToDelete?.name}
        loading={deleting}
      />
    </DashboardLayout>
  );
}

export default UserManagement;
