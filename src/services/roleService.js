const ADMIN_ROLES = [
  "administradora",
  "administrador",
  "admin",
  "administrator",
];

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isAdministrator(user) {
  if (!user || typeof user !== "object") return false;
  const role = normalize(
    user.role || user.rol || user.tipoRol || user.userRole,
  );
  const email = normalize(user.email || user.correo);
  return ADMIN_ROLES.includes(role) || email === "admin@cafecampus.test";
}

export function workspaceHome(user) {
  return isAdministrator(user) ? "/admin" : "/caja";
}
