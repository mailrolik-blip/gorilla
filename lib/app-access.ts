import { hasGlobalStaffRole } from './global-staff-role';

export type RouteAccessUser = {
  staffRole: string | null;
  roles: string[];
};

export type RoleCapabilities = {
  isUser: boolean;
  isTrainer: boolean;
  isManager: boolean;
  isAdmin: boolean;
  canAccessCabinet: boolean;
  canAccessAdminWorkspace: boolean;
  adminAccessLevel: 'none' | 'manager' | 'admin';
  primaryEntryPath: typeof DEFAULT_ENTRY_PATH | typeof ADMIN_WORKSPACE_PATH;
  cabinetViewMode: 'primary' | 'secondary';
};

export const DEFAULT_ENTRY_PATH = '/cabinet';
export const ADMIN_WORKSPACE_PATH = '/admin';

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function getSafeUrl(requestedPath: string | null | undefined) {
  if (typeof requestedPath !== 'string') {
    return null;
  }

  const trimmedPath = requestedPath.trim();

  if (!trimmedPath.startsWith('/') || trimmedPath.startsWith('//')) {
    return null;
  }

  try {
    return new URL(trimmedPath, 'http://gorilla.local');
  } catch {
    return null;
  }
}

function getAppBasePath(requestedPath: string | null | undefined) {
  const url = getSafeUrl(requestedPath);

  if (!url) {
    return null;
  }

  const pathname = normalizePathname(url.pathname);

  if (pathname !== DEFAULT_ENTRY_PATH && pathname !== ADMIN_WORKSPACE_PATH) {
    return null;
  }

  return pathname;
}

export function getRoleCapabilities(
  currentUser: RouteAccessUser | null | undefined
): RoleCapabilities {
  const roles = new Set(currentUser?.roles ?? []);
  const staffRole = currentUser?.staffRole ?? null;
  const isAdmin = staffRole === 'ADMIN';
  const isManager = staffRole === 'MANAGER';
  const isTrainer = roles.has('COACH') || roles.has('TRAINER');
  const canAccessAdminWorkspace = hasGlobalStaffRole(staffRole);
  const adminAccessLevel = isAdmin ? 'admin' : isManager ? 'manager' : 'none';
  const primaryEntryPath = canAccessAdminWorkspace
    ? ADMIN_WORKSPACE_PATH
    : DEFAULT_ENTRY_PATH;

  return {
    isUser: roles.has('USER'),
    isTrainer,
    isManager,
    isAdmin,
    canAccessCabinet: Boolean(currentUser),
    canAccessAdminWorkspace,
    adminAccessLevel,
    primaryEntryPath,
    cabinetViewMode: canAccessAdminWorkspace ? 'secondary' : 'primary',
  };
}

export function sanitizeRequestedAppPath(requestedPath: string | null | undefined) {
  const url = getSafeUrl(requestedPath);

  if (!url) {
    return null;
  }

  const pathname = normalizePathname(url.pathname);

  if (pathname !== DEFAULT_ENTRY_PATH && pathname !== ADMIN_WORKSPACE_PATH) {
    return null;
  }

  return `${pathname}${url.search}${url.hash}`;
}

export function getPrimaryAppPath(
  currentUser: RouteAccessUser | null | undefined
) {
  return getRoleCapabilities(currentUser).primaryEntryPath;
}

export function canAccessAppPath(
  currentUser: RouteAccessUser | null | undefined,
  requestedPath: string | null | undefined
) {
  const capabilities = getRoleCapabilities(currentUser);
  const basePath = getAppBasePath(requestedPath);

  if (!basePath) {
    return false;
  }

  if (basePath === ADMIN_WORKSPACE_PATH) {
    return capabilities.canAccessAdminWorkspace;
  }

  if (basePath === DEFAULT_ENTRY_PATH) {
    return capabilities.canAccessCabinet;
  }

  return false;
}

export function resolveAuthorizedAppPath(
  currentUser: RouteAccessUser | null | undefined,
  requestedPath: string | null | undefined
) {
  const primaryEntryPath = getPrimaryAppPath(currentUser);
  const safePath = sanitizeRequestedAppPath(requestedPath);

  if (!safePath) {
    return primaryEntryPath;
  }

  if (!canAccessAppPath(currentUser, safePath)) {
    return primaryEntryPath;
  }

  return safePath;
}
