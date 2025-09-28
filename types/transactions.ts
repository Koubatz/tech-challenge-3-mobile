import { transactionLabels, transactionTypes } from "@/constants/transactions";

export type TransactionType = (typeof transactionTypes)[number];

export type TransactionLabel = (typeof transactionLabels)[number];
