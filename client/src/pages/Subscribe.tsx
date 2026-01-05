import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?subscription_success=true`,
      },
    });

    if (error) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsProcessing(false);
    } else {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
      setLocation('/?subscription_success=true');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-subscription-payment">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Subscribe for $9/month'
        )}
      </Button>
    </form>
  );
}

export default function Subscribe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/subscription-status'],
    enabled: !!user,
  });

  const createSubscription = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/create-subscription') as Response;
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.status === 'active' || data.status === 'trialing') {
        queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
        toast({
          title: 'Subscription active',
          description: 'Your premium subscription is now active!',
        });
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-subscription-auth-required">
              <XCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please sign in or create an account to subscribe to premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/login')} className="w-full" data-testid="button-goto-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if ((subscriptionData as any)?.hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-subscription-active">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Premium Subscription Active
            </CardTitle>
            <CardDescription>
              You're all set! Your data is syncing across all your devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium text-foreground">{(subscriptionData as any).status}</span>
              </p>
              {(subscriptionData as any).currentPeriodEnd && (
                <p className="text-sm text-muted-foreground mt-2">
                  Next billing:{' '}
                  <span className="font-medium text-foreground">
                    {new Date((subscriptionData as any).currentPeriodEnd * 1000).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
            <Button onClick={() => setLocation('/')} className="w-full" data-testid="button-goto-home">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle data-testid="text-subscription-title">Premium Subscription</CardTitle>
          <CardDescription>
            Sync your betting data across all devices with cloud storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {/* Core Features */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Cloud Sync</p>
                <p className="text-sm text-muted-foreground">
                  Access your data from any device, anytime
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Automatic Backup</p>
                <p className="text-sm text-muted-foreground">
                  Never lose your betting history and analytics
                </p>
              </div>
            </div>
            
            {/* New Premium Features */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Streak Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Identify winning and losing patterns in your betting history
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Multiple Bankrolls</p>
                <p className="text-sm text-muted-foreground">
                  Track separate bankrolls for different strategies or sportsbooks
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Advanced Export</p>
                <p className="text-sm text-muted-foreground">
                  PDF reports, Excel formatting, and tax-ready exports
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Priority Support</p>
                <p className="text-sm text-muted-foreground">
                  Get faster response times via email and chat
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Early Access</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to try new features before anyone else
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-2xl font-bold text-primary" data-testid="text-subscription-price">
              $9<span className="text-lg font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">Cancel anytime, no commitments</p>
          </div>

          {createSubscription.data?.clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: createSubscription.data.clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: 'hsl(217, 91%, 60%)',
                  },
                },
              }}
            >
              <CheckoutForm clientSecret={createSubscription.data.clientSecret} />
            </Elements>
          ) : (
            <Button
              onClick={() => createSubscription.mutate()}
              disabled={createSubscription.isPending}
              className="w-full"
              data-testid="button-start-subscription"
            >
              {createSubscription.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            By subscribing, you agree to automatic monthly billing. You can cancel at any time from
            your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
