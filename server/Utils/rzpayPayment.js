const crypto = require("crypto");
const { catchAsync } = require("./catchAsync");
const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

exports.createPaymentOrder = async (amount, orderOptions) => {
  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
    receipt: orderOptions.receipt,
    notes: {
      user: orderOptions.userId,
      purpose: orderOptions.purpose,
    },
  };

  const order = await razorpay.orders.create(options);

  return order;
};

exports.verifyPaymentOrder = async (req) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");

  if (digest !== razorpay_signature) return false;

  const trx = await razorpay.payments.fetch(razorpay_payment_id);

  return trx;
};
