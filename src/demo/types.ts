import * as DataGenerator from "data-generator-retail";

export type ThemeName = "light" | "dark";

export type Category = DataGenerator.Category & {
  color: string;
};
export type Product = DataGenerator.Product;
export type Customer = DataGenerator.Customer & {
  phone?: string;
};
export type Order = DataGenerator.Order;
export type Invoice = DataGenerator.Invoice;
export type Review = DataGenerator.Review;
export type BasketItem = DataGenerator.BasketItem;

export interface Subscription {
  id: number;
  customer_id: number;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled";
  start_date: string;
  usage: {
    api_calls: { used: number; limit: number };
    storage_mb: { used: number; limit: number };
  };
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  key_truncated: string;
  scopes: string[];
  created_at: string;
  last_used: string | null;
}

export interface Webhook {
  id: number;
  url: string;
  event_types: string[];
  status: "active" | "paused" | "failing";
  last_triggered: string | null;
  failure_count: number;
}

export interface ScheduledJob {
  id: number;
  name: string;
  cron: string;
  description: string;
  status: "running" | "idle" | "failed" | "disabled";
  last_run: string | null;
  next_run: string | null;
  last_duration_ms: number | null;
}

export interface Approval {
  id: number;
  resource_type: "order" | "subscription_upgrade" | "refund";
  record_id: number;
  amount?: number;
  reason: string;
  requested_by: number;
  approved_by_1: number | null;
  approved_by_2: number | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
