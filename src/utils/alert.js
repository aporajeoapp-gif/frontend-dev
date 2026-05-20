import Swal from "sweetalert2";

export const confirmDelete = async () => {
  return await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#ef4444",
  });
};
export const confirmLogout = async () => {
  return await Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out from your account",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Logout",
    confirmButtonColor: "#ef4444", // red
    cancelButtonColor: "#6b7280", // gray
  });
};

export const successAlert = (msg) =>
  Swal.fire("Success", msg, "success");

export const extractApiErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const errorAlert = (messageOrError, maybeError) => {
  let message = "Something went wrong";

  if (maybeError) {
    message = extractApiErrorMessage(maybeError, messageOrError);
  } else if (typeof messageOrError === "string") {
    message = messageOrError;
  } else {
    message = extractApiErrorMessage(messageOrError, message);
  }

  Swal.fire("Error", message, "error");
};
