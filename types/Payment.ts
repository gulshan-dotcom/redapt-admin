export interface IPayment {
  _id: string;
  paymentId: string;
  byUser: string;
  status: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}