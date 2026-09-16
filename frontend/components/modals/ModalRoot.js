"use client";

import { useDispatch, useSelector } from "react-redux";
import { selectModal, closeModal } from "@/redux/slices/GlobalSlice";
import TalkTrackModal from "./TalkTrackModal/TalkTrackModal";
import AdminModal from "./AdminModal/AdminModal";
import OrderDetailModal from "./OrderDetailModal/OrderDetailModal";
import styles from "./Modal.module.css";
import SyncModal from "./SyncModal/SyncModal";
const MODAL_SIZE_CLASS = {
  productDetail: "cardProduct",
  orderDetail: "cardOrder",
};

export default function ModalRoot() {
  const modal = useSelector(selectModal);
  const dispatch = useDispatch();
  if (!modal) return null;

  function close() {
    dispatch(closeModal());
  }

  const sizeClass = styles[MODAL_SIZE_CLASS[modal.type]] || "";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={`${styles.card} ${sizeClass}`}>
        {modal.type === "talkTrack" && <TalkTrackModal onClose={close} />}
        {modal.type === "admin" && <AdminModal onClose={close} />}
        {modal.type === "sync" && <SyncModal onClose={close} />}
        {modal.type === "orderDetail" && <OrderDetailModal onClose={close} />}
      </div>
    </div>
  );
}
