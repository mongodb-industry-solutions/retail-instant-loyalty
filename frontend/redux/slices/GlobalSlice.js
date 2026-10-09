import { createSlice } from "@reduxjs/toolkit";
import { toast } from "@via-ds/components/toast";

const INITIAL_STATE = {
  view: "persona",
  users: {
    loading: true,
    error: null,
    data: [],
  },
  selectedUser: null,
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
  lastOrder: null,
  lastRedeem: null,
  inspectedEvent: null,
  // Which of the two happened most recently — drives the confirm page's
  // header/receipt/tier-track so a redeem after an order doesn't keep
  // showing the stale purchase.
  lastEvent: null,
  cart: {},
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
    updateSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    // Merges a partial update (e.g. from the customer change-stream) into
    // the current selectedUser, instead of replacing it wholesale.
    patchSelectedUser(state, action) {
      if (!state.selectedUser) return;
      state.selectedUser = { ...state.selectedUser, ...action.payload };
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
      console.log("Setting loyalty config data:", action.payload);
      const { rewardDetails, campaign } = action.payload;
      state.loyaltyConfig = {
        rewardDetails,
        campaign,
        loading: false,
        error: null,
      };
    },
    openModal(state, action) {
      state.inspectedEvent = null;
      state.modal = {
        type: action.payload.modalType,
        props: action.payload.props || {},
      };
    },
    closeModal(state) {
      state.modal = null;
      state.inspectedEvent = null;
    },
    setInspectedEvent(state, action) {
      const event = action.payload;
      if (
        event &&
        (state.modal?.type !== "orderDetail" ||
          state.modal.props?.id !== event.order?.orderId ||
          state.selectedUser?.customerId !== event.order?.customerId)
      ) {
        return;
      }
      state.inspectedEvent = event;
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
    cartRemove(state, action) {
      delete state.cart[action.payload];
    },

    placeOrderSuccess(state, action) {
      const { order, loyalty } = action.payload;
      state.lastOrder = { order, loyalty };
      state.lastEvent = "order";

      if (state.selectedUser && loyalty) {
        state.selectedUser.loyaltyDetails.coinBalance = loyalty.newBalance;
        state.selectedUser.loyaltyDetails.activeTier = loyalty.newTier;
        state.selectedUser.loyaltyDetails.dollarsNeededForNextTier =
          loyalty.dollarsNeededForNextTier;
        state.selectedUser.loyaltyDetails.cumulativeSpendDollars =
          (state.selectedUser.loyaltyDetails.cumulativeSpendDollars ?? 0) +
          (loyalty.qualifyingSpend ?? 0);
        state.selectedUser.ordersCount =
          (state.selectedUser.ordersCount ?? 0) + 1;
      }
      state.cart = {};
    },

    confirmRedeemOrderSuccess(state, action) {
      const { order, loyalty } = action.payload;
      state.lastRedeem = { order, loyalty };
      state.lastEvent = "redeem";
      if (state.selectedUser && loyalty) {
        state.selectedUser.loyaltyDetails.coinBalance = loyalty.newBalance;
        state.selectedUser.loyaltyDetails.activeTier = loyalty.newTier;
        state.selectedUser.loyaltyDetails.dollarsNeededForNextTier =
          loyalty.dollarsNeededForNextTier;
        state.selectedUser.loyaltyDetails.cumulativeSpendDollars =
          (state.selectedUser.loyaltyDetails.cumulativeSpendDollars ?? 0) +
          (loyalty.qualifyingSpend ?? 0);
        state.selectedUser.ordersCount =
          (state.selectedUser.ordersCount ?? 0) + 1;
      }
    },

    updateOrdersData(state, action) {
      state.Global.lastOrder;
    },

    saveRewardDetailsSuccess(state, action) {
      state.loyaltyConfig.rewardDetails = action.payload.rewardDetails;
    },
    saveCampaignSuccess(state, action) {
      state.loyaltyConfig.campaign = action.payload.campaign;
    },

    setOrdersLoading(state) {
      state.orders.loading = true;
      state.orders.error = null;
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
  updateSelectedUser,
  patchSelectedUser,
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
  setInspectedEvent,
  saveRewardDetailsSuccess,
  saveCampaignSuccess,
  cartIncrement,
  cartDecrement,
  cartRemove,
  resetGlobalState,
} = GlobalSlice.actions;

export const selectView = (state) => state.Global.view;
export const selectUsers = (state) => state.Global.users;
export const selectSelectedUser = (state) => state.Global.selectedUser;
export const selectProductsState = (state) => state.Global.products;
export const selectProductsData = (state) => state.Global.products.data;
export const selectLastOrder = (state) => state.Global.lastOrder;
export const selectLastRedeem = (state) => state.Global.lastRedeem;
export const selectLastEvent = (state) => state.Global.lastEvent;
export const selectActiveEvent = (state) =>
  state.Global.lastEvent === "redeem"
    ? state.Global.lastRedeem
    : state.Global.lastOrder;
export const selectInspectedEvent = (state) => {
  const { modal, inspectedEvent, selectedUser } = state.Global;
  return modal?.type === "orderDetail" &&
    inspectedEvent?.order?.orderId === modal.props?.id &&
    inspectedEvent?.order?.customerId === selectedUser?.customerId
    ? inspectedEvent
    : null;
};
export const selectDisplayedEvent = (state) =>
  state.Global.modal?.type === "orderDetail"
    ? selectInspectedEvent(state)
    : selectActiveEvent(state);
export const selectLoyaltyConfig = (state) => state.Global.loyaltyConfig;
export const selectModal = (state) => state.Global.modal;
export const selectCart = (state) => state.Global.cart;

export default GlobalSlice.reducer;
