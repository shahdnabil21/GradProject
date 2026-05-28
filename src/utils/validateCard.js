export const validateCard = ({ cardNumber, expiry, cvv }) => {
  if (!cardNumber || !expiry || !cvv) {
    throw new Error("Missing card details");
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    throw new Error("Invalid card number");
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    throw new Error("Invalid CVV");
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw new Error("Invalid expiry format (MM/YY)");
  }

  const [monthStr, yearStr] = expiry.split("/");
  const month = Number(monthStr);
  const year = Number("20" + yearStr);

  if (month < 1 || month > 12) {
    throw new Error("Invalid expiry month");
  }

  const expiryDate = new Date(year, month, 0);
  const now = new Date();

  if (expiryDate <= now) {
    throw new Error("Card is expired");
  }

  return true;
};