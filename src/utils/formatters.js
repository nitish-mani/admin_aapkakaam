export const formatCurrency = (amount, currency = "INR") => {
  if (!amount && amount !== 0) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("en-IN");
};

export const formatDate = (date, format = "short") => {
  if (!date) return "N/A";

  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (format === "long") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toISOString();
};

export const formatTimeAgo = (date) => {
  if (!date) return "N/A";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date, "short");
};

export const getStatusColor = (status) => {
  const colors = {
    active: "#4caf50",
    completed: "#2196f3",
    cancelled: "#f44336",
    pending: "#ff9800",
    blocked: "#f44336",
    success: "#4caf50",
    failed: "#f44336",
    refunded: "#9e9e9e",
    verified: "#4caf50",
    unverified: "#ff9800",
  };
  return colors[status] || "#9e9e9e";
};

export const getStatusLabel = (status) => {
  const labels = {
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
    blocked: "Blocked",
    success: "Success",
    failed: "Failed",
    refunded: "Refunded",
    verified: "Verified",
    unverified: "Unverified",
  };
  return labels[status] || status;
};

export const truncateText = (text, length = 50) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

export const getInitials = (name) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
