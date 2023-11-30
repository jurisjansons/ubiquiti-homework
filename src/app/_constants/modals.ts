import { type AddItemModalProps } from "../_components/modals/Item";
import { type AproveModalProps } from "../_components/modals/Approve";
import { type CreateListModalProps } from "../_components/modals/List";
import { type ShareModalProps } from "../_components/modals/Share";

export enum MODALS {
  APPROVE = "APPROVE",
  LIST = "LIST",
  ITEM = "ITEM",
  SHARE = "SHARE",
}

export interface ModalBaseProps {
  id: string;
}

export type Modal =
  | ({
      type: MODALS.APPROVE;
    } & AproveModalProps)
  | ({
      type: MODALS.LIST;
    } & CreateListModalProps)
  | ({
      type: MODALS.ITEM;
    } & AddItemModalProps)
  | ({
      type: MODALS.SHARE;
    } & ShareModalProps);
