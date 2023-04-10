type Storage = "SESSION" | "LOCAL";

export const storage = {
  getItem: (name: string, type: Storage) => {
    switch (type) {
      case "SESSION":
        return sessionStorage.getItem(name);

      case "LOCAL":
        return localStorage.getItem(name);
    }
  },
  setItem: (key: string, value: string, type: Storage) => {
    switch (type) {
      case "SESSION":
        return sessionStorage.setItem(key, value);

      case "LOCAL":
        return localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string, type: Storage) => {
    switch (type) {
      case "SESSION":
        return sessionStorage.removeItem(key);

      case "LOCAL":
        return localStorage.removeItem(key);
    }
  },
  clear: (type: Storage) => {
    switch (type) {
      case "SESSION":
        return sessionStorage.clear();

      case "LOCAL":
        return localStorage.clear();
    }
  },
};
