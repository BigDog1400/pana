type LocalStorageTourKeys = 'account-tour-completed' | 'transaction-tour-completed';

export function checkLocalStorageForTourDisplay(key: LocalStorageTourKeys): boolean {
  const value = localStorage.getItem(key);
  if (value === null) {
    return false;
  } else {
    return true;
  }
}

export function setLocalStorageForTourCompleted(key: LocalStorageTourKeys): void {
  localStorage.setItem(key, 'true');
}
