import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function PaymentCheckout({ orderId, amount, items }: any) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'mobile'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const createPaymentMutation = trpc.payment.createMarketplacePaymentIntent.useMutation();
  const confirmPaymentMutation = trpc.payment.confirmPayment.useMutation();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Create payment intent
      const paymentIntent = await createPaymentMutation.mutateAsync({
        orderId,
        items,
        currency: 'NGN',
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const result = await confirmPaymentMutation.mutateAsync({
        paymentIntentId: paymentIntent.paymentIntentId,
        paymentMethodId: `pm_${Math.random().toString(36).substr(2, 9)}`,
      });

      setPaymentStatus('success');
    } catch (error) {
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been confirmed and will be processed shortly.</p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-bold text-gray-900">#{orderId}</p>
            </div>

            <div className="space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-bold text-gray-900">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-bold text-gray-900">Card ending in 4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt</span>
                <Button variant="link" size="sm">Download</Button>
              </div>
            </div>

            <Button className="w-full">View Order Details</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">₦{item.price.toLocaleString()}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₦{(amount * 0.95).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-gray-900">₦5,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">₦{amount.toLocaleString()}</span>
                  </div>
                </div>

                <Badge className="w-full justify-center mt-4">
                  <Lock className="w-3 h-3 mr-1" />
                  Secure Payment
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Select Payment Method</label>
                    <div className="space-y-2">
                      {[
                        { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                        { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                        { id: 'mobile', label: 'Mobile Money', icon: '📱' },
                      ].map((method) => (
                        <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-4 h-4"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">{method.icon} {method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={cardDetails.cardholderName}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-900">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank' && (
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-gray-900">Bank Transfer Details</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Bank Name: Access Bank</p>
                        <p>Account Number: 1234567890</p>
                        <p>Account Name: FarmKonnect Nigeria</p>
                        <p>Amount: ₦{amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Details */}
                  {paymentMethod === 'mobile' && (
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-gray-900">Mobile Money Instructions</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Dial *901*1*{amount}# on your phone</p>
                        <p>Or send to: +234 800 123 4567</p>
                        <p>Reference: ORD-{orderId}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {paymentStatus === 'failed' && (
                    <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Payment Failed</p>
                        <p className="text-sm text-red-700">Please try again or contact support</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 text-base"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ₦{amount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    Your payment information is secure and encrypted
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
