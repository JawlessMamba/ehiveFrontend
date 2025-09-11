const API_ROUTE = {
  asset: {
    createAsset: "/asset/createAsset",
    getAllAssets: "/asset/getAllAssets",
    exportAssets: "/asset/export", 
    deleteAsset: "/asset/deleteAsset/:id", 
    markSurplus: '/asset/assets/:id/surplus', 
    updateAsset: "/asset/assets/:id",
    getDropdownOptions: "/asset/dropdown-options",
    getFilterOptions: "/asset/filter-options", 
      checkExpiring: "/asset/check-expiring",
  },
  category: {
    getCategories: "/categories/:category",
    addCategory: "/categories/:category",
    deleteCategory: "/categories/:category/:id",
  },
  assetTransfer: {
    createTransfer: "/asset-transfers/create-transfer-asset",
    getAllTransfers: "/asset-transfers/get-all-transfer-assets",
    getAssetHistory: "/asset-transfers/asset-history/:id",
    deleteTransfer: "/asset-transfers/asset-transfers/:id",
  },
  user: {
    signUp: "/user/signup",
    signIn: "/user/signin", 
    getUser: "/user/getuser",
    getAllUsers: "/user/all",
    changePassword: "/user/change-password",
    toggleStatus: "/user/toggle-status"
  },
};

export default API_ROUTE;