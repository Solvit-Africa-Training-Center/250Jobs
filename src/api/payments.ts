import http from "../lib/http";

export interface Plan {
  id: number;
  name: string;
  duration_months: number;
  price: string; // comes as string from backend
  currency: string;
  stripe_price_id?: string;
}

export interface SubscriptionItem {
  id: number;
  user: number;
  user_username: string;
  plan: number;
  plan_name: string;
  amount: string;
  status: string; // ACTIVE, CANCELED, etc.
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function listPlans(): Promise<Plan[]> {
  const res = await http.get<Plan[]>("/payments/plans/");
  return res.data;
}

export async function mySubscriptions(): Promise<SubscriptionItem[]> {
  const res = await http.get<SubscriptionItem[]>("/payments/me/subscriptions/");
  return res.data;
}

export async function initSubscribe(plan_id: number): Promise<{ checkout_url: string; tx_ref: string }> {
  const res = await http.post<{ checkout_url: string; tx_ref: string }>("/payments/subscribe/", { plan_id });
  return res.data;
}

