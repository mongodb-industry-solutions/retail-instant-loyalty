import { createSlice } from "@reduxjs/toolkit";
import { toast } from "@via-ds/components/toast";

const INITIAL_STATE = {
  view: "persona",
  users: {
    loading: true,
    error: null,
    data: [],
  },
  selectedUser: null, // null or {...user from users collection}
  products: {
    loading: true,
    error: null,
    data: [],
  },
  loyaltyConfig: {
    loading: true,
    error: null,
    rewardDetails: [],
    campaign: [],
  },
  lastOrder: null, // null or {...order from orders collection}
  lastRedeem: null, // null or {...redeem from redeems collection}
  cart: {},
  redeem: { productId: null },
};

const GlobalSlice = createSlice({
  name: "Global",
  initialState: {
    ...INITIAL_STATE,
  },
  reducers: {
    setView(state, action) {
      state.view = action.payload;
    },
    setUsersLoading(state, action) {
      state.users.loading = action.payload;
    },
    setUsersError(state, action) {
      state.users.error = action.payload;
    },
    setUsersData(state, action) {
      state.users.data = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    setProductsLoading(state, action) {
      state.products.loading = action.payload;
    },
    setProductsError(state, action) {
      state.products.loading = false;
      state.products.error = action.payload;
    },
    setProductsData(state, action) {
      state.products = {
        data: action.payload,
        loading: false,
        error: null,
      };
    },
    setLoyaltyConfigLoading(state, action) {
      state.loyaltyConfig.loading = action.payload;
    },
    setLoyaltyConfigError(state, action) {
      state.loyaltyConfig.loading = false;
      state.loyaltyConfig.error = action.payload;
    },
    setLoyaltyConfigData(state, action) {
      const { rewardDetails, campaign, orderMeta } = action.payload;
      state.loyaltyConfig = {
        rewardDetails,
        campaign,
        loading: false,
        error: null,
      };
    },
    openModal(state, action) {
      state.modal = {
        type: action.payload.modalType,
        props: action.payload.props || {},
      };
    },
    closeModal(state) {
      state.modal = null;
    },

    cartIncrement(state, action) {
      const productId = action.payload;

      if (state.cart[productId]) {
        state.cart[productId] += 1;
      } else {
        state.cart[productId] = 1;
      }
    },

    cartDecrement(state, action) {
      const productId = action.payload;
      if (state.cart[productId]) {
        state.cart[productId] -= 1;
        if (state.cart[productId] <= 0) {
          delete state.cart[productId];
        }
      }
    },
    placeOrderSuccess(state, action) {
      // API response envelope: { order, loyalty }. loyalty already carries
      // oldBalance/newBalance and oldTier/newTier directly -- no separate
      // customer object is returned, so there is nothing to diff here.
      const order = action.payload;
      state.lastOrder = { order };
      if (state.selectedUser) {
        // state.selectedUser.loyaltyDetails.balance = loyalty.newBalance;
        // state.selectedUser.loyaltyDetails.activeTier = loyalty.newTier;
      }
      state.cart = {};
    },

    selectReward(state, action) {
      state.redeem = {
        productId: action.payload,
      };
    },
    resetReward(state) {
      state.redeem = { productId: null };
    },
    confirmRedeemOrderSuccess(state, action) {
      console.log("Confirm redeem order success payload:", action.payload);
      const redeem = action.payload;
      state.lastRedeem = { redeem };
      state.redeem = { productId: null };
    },

    saveRewardDetailsSuccess(state, action) {
      state.loyaltyConfig.rewardDetails = action.payload.rewardDetails;
    },
    saveCampaignSuccess(state, action) {
      state.loyaltyConfig.campaign = action.payload.campaign;
    },

    resetGlobalState: () => INITIAL_STATE,
  },
});

export const getCartCount = (state) => {
  return Object.values(state.Global.cart).reduce((a, b) => a + b, 0);
};

// To be used as a thunk action for adding a product to the cart
export function addToCart(productId) {
  return (dispatch, getState) => {
    console.log("state of cart is ", getState().Global.cart);
    const product = selectProductsData(getState()).find(
      (product) => product.productId === productId,
    );
    if (product) {
      toast.success(`Added ${product.name} to cart`);
      dispatch(cartIncrement(productId));
    }
  };
}

export const {
  setView,
  setUsersLoading,
  setUsersError,
  setSelectedUser,
  setUsersData,
  setProductsLoading,
  setProductsData,
  setProductsError,
  setLoyaltyConfigLoading,
  setLoyaltyConfigData,
  setLoyaltyConfigError,
  placeOrderSuccess,
  confirmRedeemOrderSuccess,
  openModal,
  closeModal,
  saveRewardDetailsSuccess,
  saveCampaignSuccess,
  cartIncrement,
  cartDecrement,
  selectReward,
  resetReward,
  resetGlobalState,
} = GlobalSlice.actions;

export const selectView = (state) => state.Global.view;
export const selectUsers = (state) => state.Global.users;
export const selectSelectedUser = (state) => state.Global.selectedUser;
export const selectProductsState = (state) => state.Global.products;
export const selectProductsData = (state) => state.Global.products.data;
export const selectLastOrder = (state) => state.Global.lastOrder;
export const selectLoyaltyConfig = (state) => state.Global.loyaltyConfig;
export const selectModal = (state) => state.Global.modal;
export const selectCart = (state) => state.Global.cart;
export const selectRedeem = (state) => state.Global.redeem;

export default GlobalSlice.reducer;
