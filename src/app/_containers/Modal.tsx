"use client";

import { useAppStore } from "~/lib/store";

import { MODALS } from "../_constants/modals";

import ApproveModal from "../_components/modals/Approve";
import ListModal from "../_components/modals/List";
import ItemModal from "../_components/modals/Item";
import ShareModal from "../_components/modals/Share";

export default function ModalContainer() {
  const { modals } = useAppStore();

  return (
    <>
      {modals.map((modal) => {
        switch (modal.type) {
          case MODALS.APPROVE:
            return <ApproveModal key={modal.id} {...modal} />;
          case MODALS.LIST:
            return <ListModal key={modal.id} {...modal} />;
          case MODALS.ITEM:
            return <ItemModal key={modal.id} {...modal} />;
          case MODALS.SHARE:
            return <ShareModal key={modal.id} {...modal} />;
          default:
            return null;
        }
      })}
    </>
  );
}
